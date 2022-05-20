import { useState, useRef } from 'react';
import { v4 as uuid } from 'uuid';

import SendbirdChat, { UserUpdateParams } from '@sendbird/chat';
import {
    OpenChannelModule,
    OpenChannelHandler,
    OpenChannelCreateParams,
    OpenChannelUpdateParams
} from '@sendbird/chat/openChannel';

import {
    UserMessageUpdateParams,
    UserMessageCreateParams,
    MessageListParams,
    FileMessageCreateParams
} from '@sendbird/chat/message';

import { SENDBIRD_INFO } from '../constants/constants';
import { timestampToTime } from '../utils/messageUtils';

let sb;

const OpenChannelMetadataAndMetacounter = (props) => {

    const [state, updateState] = useState({
        currentlyJoinedChannel: null,
        currentlyUpdatingChannel: null,
        messages: [],
        channels: [],
        showChannelCreate: false,
        messageInputValue: "",
        userNameInputValue: "",
        userIdInputValue: "",
        channelNameInputValue: "",
        settingUpUser: true,
        file: null,
        messageToUpdate: null,
        loading: false,
        error: false,
        isOpenMetadataModal: false,
        metadataKeyInputValue: "",
        metadataValueInputValue: "",
        metadataObject: {},
        currentMetadataObject: {},
        metadataItemToUpdate: null,
        isOpenMetacounterModal: false,
        metacounterKeyInputValue: "",
        metacounterValueInputValue: "",
        metacounterObject: {},
        currentMetacounterObject: {},
        metacounterItemToUpdate: null
    });

    //need to access state in message reeived callback
    const stateRef = useRef();
    stateRef.current = state;

    const onError = (error) => {
        updateState({ ...state, error: error.message });
        console.log(error);
    }

    const handleJoinChannel = async (channelUrl) => {
        const { channels } = state;
        updateState({ ...state, loading: true });
        const channelToJoin = channels.find((channel) => channel.url === channelUrl);
        const [channel, messages, error] = await joinChannel(channelToJoin);
        if (error) {
            return onError(error);

        }

        const metaData = await channel.getMetaData([]);
        const metaCounters = await channel.getMetaCounters([]);

        //listen for incoming messages
        const channelHandler = new OpenChannelHandler();
        channelHandler.onMessageUpdated = (channel, message) => {
            const messageIndex = stateRef.current.messages.findIndex((item => item.messageId == message.messageId));
            const updatedMessages = [...stateRef.current.messages];
            updatedMessages[messageIndex] = message;
            updateState({ ...stateRef.current, messages: updatedMessages });
        }

        channelHandler.onMessageReceived = (channel, message) => {
            const updatedMessages = [...stateRef.current.messages, message];
            updateState({ ...stateRef.current, messages: updatedMessages });
        };

        channelHandler.onMessageDeleted = (channel, message) => {
            const updatedMessages = stateRef.current.messages.filter((messageObject) => {
                return messageObject.messageId !== message;
            });
            updateState({ ...stateRef.current, messages: updatedMessages });
        }
        sb.openChannel.addOpenChannelHandler(uuid(), channelHandler);
        updateState({ ...state, currentlyJoinedChannel: channel, messages: messages, loading: false, currentMetadataObject: metaData })
    }

    const handleLeaveChannel = async () => {
        const { currentlyJoinedChannel } = state;
        await currentlyJoinedChannel.exit();

        updateState({ ...state, currentlyJoinedChannel: null })

    }

    const handleCreateChannel = async () => {
        const { channelNameInputValue } = state;
        const [openChannel, error] = await createChannel(channelNameInputValue);
        if (error) {
            return onError(error);
        }
        const updatedChannels = [openChannel, ...state.channels];
        updateState({ ...state, channels: updatedChannels, showChannelCreate: false });
    }

    const handleDeleteChannel = async (channelUrl) => {
        const [channel, error] = await deleteChannel(channelUrl);
        if (error) {
            return onError(error);
        }
        const updatedChannels = state.channels.filter((channel) => {
            return channel.url !== channelUrl;
        });
        updateState({ ...state, channels: updatedChannels });
    }

    const handleUpdateChannel = async () => {
        const { currentlyUpdatingChannel, channelNameInputValue, channels } = state;
        const [updatedChannel, error] = await updateChannel(currentlyUpdatingChannel, channelNameInputValue);
        if (error) {
            return onError(error);
        }
        const indexToReplace = channels.findIndex((channel) => channel.url === currentlyUpdatingChannel.channelUrl);
        const updatedChannels = [...channels];
        updatedChannels[indexToReplace] = updatedChannel;
        updateState({ ...state, channels: updatedChannels, currentlyUpdatingChannel: null });
    }

    const toggleChannelDetails = (channel) => {
        if (channel) {
            updateState({ ...state, currentlyUpdatingChannel: channel });
        } else {
            updateState({ ...state, currentlyUpdatingChannel: null });
        }
    }

    const toggleShowCreateChannel = () => {
        updateState({ ...state, showChannelCreate: !state.showChannelCreate });
    }

    const onChannelNamenIputChange = (e) => {
        const channelNameInputValue = e.currentTarget.value;
        updateState({ ...state, channelNameInputValue });
    }

    const onUserNameInputChange = (e) => {
        const userNameInputValue = e.currentTarget.value;
        updateState({ ...state, userNameInputValue });
    }

    const onUserIdInputChange = (e) => {
        const userIdInputValue = e.currentTarget.value;
        updateState({ ...state, userIdInputValue });
    }

    const onMessageInputChange = (e) => {
        const messageInputValue = e.currentTarget.value;
        updateState({ ...state, messageInputValue });
    }

    const sendMessage = async () => {
        const { messageToUpdate, currentlyJoinedChannel, messages } = state;

        if (messageToUpdate) {
            const userMessageUpdateParams = new UserMessageUpdateParams();
            userMessageUpdateParams.message = state.messageInputValue;
            const updatedMessage = await currentlyJoinedChannel.updateUserMessage(messageToUpdate.messageId, userMessageUpdateParams)
            const messageIndex = messages.findIndex((item => item.messageId == messageToUpdate.messageId));
            messages[messageIndex] = updatedMessage;
            updateState({ ...state, messages: messages, messageInputValue: "", messageToUpdate: null });
        } else {
            const userMessageParams = new UserMessageCreateParams();
            userMessageParams.message = state.messageInputValue;
            currentlyJoinedChannel.sendUserMessage(userMessageParams).onSucceeded((message) => {
                const updatedMessages = [...messages, message];
                updateState({ ...state, messages: updatedMessages, messageInputValue: "" });

            }).onFailed((error) => {
                console.log(error)
                console.log("failed")
            });

        }
    }

    const onFileInputChange = async (e) => {
        if (e.currentTarget.files && e.currentTarget.files.length > 0) {
            const { currentlyJoinedChannel, messages } = state;
            const fileMessageParams = new FileMessageCreateParams();
            fileMessageParams.file = e.currentTarget.files[0];
            currentlyJoinedChannel.sendFileMessage(fileMessageParams).onSucceeded((message) => {
                const updatedMessages = [...messages, message];
                updateState({ ...state, messages: updatedMessages, messageInputValue: "", file: null });

            }).onFailed((error) => {
                console.log(error)
                console.log("failed")
            });
        }
    }

    const handleDeleteMessage = async (messageToDelete) => {
        const { currentlyJoinedChannel } = state;
        await deleteMessage(currentlyJoinedChannel, messageToDelete); // Delete

    }

    const updateMessage = async (message) => {
        updateState({ ...state, messageToUpdate: message, messageInputValue: message.message });
    }

    const setupUser = async () => {
        const { userNameInputValue, userIdInputValue } = state;
        const sendbirdChat = await SendbirdChat.init({
            appId: SENDBIRD_INFO.appId,
            localCacheEnabled: false,
            modules: [new OpenChannelModule()]
        });



        await sendbirdChat.connect(userIdInputValue);
        await sendbirdChat.setChannelInvitationPreference(true);

        const userUpdateParams = new UserUpdateParams();
        userUpdateParams.nickname = userNameInputValue;
        userUpdateParams.userId = userIdInputValue;
        await sendbirdChat.updateCurrentUserInfo(userUpdateParams);

        sb = sendbirdChat;
        updateState({ ...state, loading: true });
        const [channels, error] = await loadChannels();
        if (error) {
            return onError(error);
        }
        updateState({ ...state, channels: channels, loading: false, settingUpUser: false });
    }

    const toggleMetadataModal = async () => {
      const { isOpenMetadataModal } = state;
      updateState({ ...state, isOpenMetadataModal: !isOpenMetadataModal })
    }

    const saveMetadata = async () => {
      const { metadataObject, currentlyJoinedChannel, currentMetadataObject } = state;
      const isEmpty = Object.keys(metadataObject).length === 0;
      const isUpdate = Object.keys(metadataObject).length < Object.keys(currentMetadataObject).length
      if(isEmpty) {
        alert("Metadata empty")
        return null
      } else if(isUpdate) {
        const upsertIfKeyNotExist = true;
        await currentlyJoinedChannel.updateMetaData(currentMetadataObject, upsertIfKeyNotExist);
      } else {
        await currentlyJoinedChannel.createMetaData(metadataObject);
      }

      toggleMetadataModal()
    }

    const addMetadataObjectItem = async () => {
      const { metadataKeyInputValue, metadataValueInputValue, metadataObject, currentMetadataObject, metadataItemToUpdate, currentlyJoinedChannel } = state
      if(metadataItemToUpdate) {

        if(metadataItemToUpdate in metadataObject) {
          let newMetadataObj = Object.assign({}, metadataObject);
          let newCurrentMetadataObject = Object.assign({}, currentMetadataObject);
          newMetadataObj[metadataKeyInputValue] = metadataValueInputValue;
          newCurrentMetadataObject[metadataKeyInputValue] = metadataValueInputValue;
          delete newMetadataObj[metadataItemToUpdate];
          delete newCurrentMetadataObject[metadataItemToUpdate]

          const data = await currentlyJoinedChannel.getMetaData([metadataItemToUpdate]);
          const isEmpty = Object.keys(data).length === 0;

          !isEmpty && await currentlyJoinedChannel.deleteMetaData(metadataItemToUpdate);
          
          updateState({ ...state, metadataObject: newMetadataObj, currentMetadataObject: newCurrentMetadataObject, metadataKeyInputValue: "", metadataValueInputValue: "", metadataItemToUpdate: null })
        } else {
          let newCurrentMetadataObject = Object.assign({}, currentMetadataObject);
          newCurrentMetadataObject[metadataKeyInputValue] = metadataValueInputValue;
          let newObject = { [metadataKeyInputValue]: metadataValueInputValue }
          delete newCurrentMetadataObject[metadataItemToUpdate]

          await currentlyJoinedChannel.deleteMetaData(metadataItemToUpdate);

          updateState({ ...state, metadataObject: newObject, currentMetadataObject: newCurrentMetadataObject, metadataKeyInputValue: "", metadataValueInputValue: "", metadataItemToUpdate: null })
        }

      } else {
        if(metadataKeyInputValue && metadataValueInputValue) {
          metadataObject[metadataKeyInputValue] = metadataValueInputValue
          currentMetadataObject[metadataKeyInputValue] = metadataValueInputValue
          updateState({ ...state, metadataObject, currentMetadataObject, metadataKeyInputValue: "", metadataValueInputValue: ""})
        } else {
          alert("Fill in key and value");
        }
      }
    }

    const updateMetadataObjectItem = async (key, value) => {
      updateState({ ...state, metadataItemToUpdate: key, metadataKeyInputValue: key, metadataValueInputValue: value })
    }

    const handleDeleteMetadataObjectItem = async (key) => {
      const { metadataObject, currentMetadataObject, currentlyJoinedChannel } = state

      let newMetadataObj = Object.assign({}, metadataObject);
      let newCurrentMetadataObject = Object.assign({}, currentMetadataObject);
      delete newMetadataObj[key];
      delete newCurrentMetadataObject[key]

      const data = await currentlyJoinedChannel.getMetaData([key]);
      const isEmpty = Object.keys(data).length === 0;

      !isEmpty && await currentlyJoinedChannel.deleteMetaData(key);

      updateState({ ...state, metadataObject: newMetadataObj, currentMetadataObject: newCurrentMetadataObject })
    }

    const onMetadataKeyInputValue = async (e) => {
      const metadataKeyInputValue = e.currentTarget.value
      updateState({ ...state, metadataKeyInputValue})
    }

    const onMetadataValueInputValue = async (e) => {
      const metadataValueInputValue = e.currentTarget.value
      updateState({ ...state, metadataValueInputValue})
    }

    const toggleMetacounterModal = async () => {
      const { isOpenMetacounterModal } = state;
      updateState({ ...state, isOpenMetacounterModal: !isOpenMetacounterModal })
    }

    const saveMetacounter = async () => {
      const { metacounterObject, currentlyJoinedChannel, currentMetacounterObject } = state;
      const isEmpty = Object.keys(metacounterObject).length === 0;
      const isUpdate = Object.keys(metacounterObject).length < Object.keys(currentMetacounterObject).length
      if(isEmpty) {
        alert("Metacounter empty")
        return null
      } else if(isUpdate) {
        const upsertIfKeyNotExist = true;
        await currentlyJoinedChannel.updateMetaCounters(currentMetacounterObject, upsertIfKeyNotExist);
      } else {
        await currentlyJoinedChannel.createMetaCounters(metacounterObject);
      }

      toggleMetacounterModal()
    }

    const addMetacounterObjectItem = async () => {
      const { metacounterKeyInputValue, metacounterValueInputValue, metacounterObject, currentMetacounterObject, metacounterItemToUpdate, currentlyJoinedChannel } = state
      if(metacounterItemToUpdate) {

        if(metacounterItemToUpdate in metacounterObject) {
          let newMetacounterObj = Object.assign({}, metacounterObject);
          let newCurrentMetacounterObject = Object.assign({}, currentMetacounterObject);
          newMetacounterObj[metacounterKeyInputValue] = metacounterValueInputValue;
          newCurrentMetacounterObject[metacounterKeyInputValue] = metacounterValueInputValue;
          delete newMetacounterObj[metacounterItemToUpdate];
          delete newCurrentMetacounterObject[metacounterItemToUpdate]

          const counter = await currentlyJoinedChannel.getMetaCounters([metacounterItemToUpdate]);
          const isEmpty = Object.keys(counter).length === 0;

          !isEmpty && await currentlyJoinedChannel.deleteMetaCounter(metacounterItemToUpdate);
          
          updateState({ ...state, metacounterObject: newMetacounterObj, currentMetacounterObject: newCurrentMetacounterObject, metacounterKeyInputValue: "", metacounterValueInputValue: "", metacounterItemToUpdate: null })
        } else {
          let newCurrentMetacounterObject = Object.assign({}, currentMetacounterObject);
          newCurrentMetacounterObject[metacounterKeyInputValue] = metacounterValueInputValue;
          let newObject = { [metacounterKeyInputValue]: metacounterValueInputValue }
          delete newCurrentMetacounterObject[metacounterItemToUpdate]

          await currentlyJoinedChannel.deleteMetaCounter(metacounterItemToUpdate);

          updateState({ ...state, metacounterObject: newObject, currentMetacounterObject: newCurrentMetacounterObject, metacounterKeyInputValue: "", metacounterValueInputValue: "", metacounterItemToUpdate: null })
        }

      } else {
        if(metacounterKeyInputValue && metacounterValueInputValue) {
          metacounterObject[metacounterKeyInputValue] = metacounterValueInputValue
          currentMetacounterObject[metacounterKeyInputValue] = metacounterValueInputValue
          updateState({ ...state, metacounterObject, currentMetacounterObject, metacounterKeyInputValue: "", metacounterValueInputValue: ""})
        } else {
          alert("Fill in key and value");
        }
      }
    }

    const updateMetacounterObjectItem = async (key, value) => {
      updateState({ ...state, metacounterItemToUpdate: key, metacounterKeyInputValue: key, metacounterValueInputValue: value })
    }

    const handleDeleteMetacounterObjectItem = async (key) => {
      const { metacounterObject, currentMetacounterObject, currentlyJoinedChannel } = state

      let newMetacounterObj = Object.assign({}, metacounterObject);
      let newCurrentMetacounterObject = Object.assign({}, currentMetacounterObject);
      delete newMetacounterObj[key];
      delete newCurrentMetacounterObject[key]

      const counter = await currentlyJoinedChannel.getMetaCounters([key]);
      const isEmpty = Object.keys(counter).length === 0;

      !isEmpty && await currentlyJoinedChannel.deleteMetaCounter(key);

      updateState({ ...state, metacounterObject: newMetacounterObj, currentMetacounterObject: newCurrentMetacounterObject })
    }

    const onMetacounterKeyInputValue = async (e) => {
      const metacounterKeyInputValue = e.currentTarget.value
      updateState({ ...state, metacounterKeyInputValue})
    }

    const onMetacounterValueInputValue = async (e) => {
      const metacounterValueInputValue = e.currentTarget.value
      updateState({ ...state, metacounterValueInputValue})
    }

    if (state.loading) {
        return <div>Loading...</div>
    }

    if (state.error) {
        return <div className="error">{state.error} check console for more information.</div>
    }

    console.log('- - - - State object very useful for debugging - - - -');
    console.log(state);

    return (
        <>
            <CreateUserForm
                setupUser={setupUser}
                userNameInputValue={state.userNameInputValue}
                userIdInputValue={state.userIdInputValue}
                settingUpUser={state.settingUpUser}
                onUserIdInputChange={onUserIdInputChange}
                onUserNameInputChange={onUserNameInputChange} />
            <ChannelList
                channels={state.channels}
                toggleChannelDetails={toggleChannelDetails}
                handleJoinChannel={handleJoinChannel}
                toggleShowCreateChannel={toggleShowCreateChannel}
                handleDeleteChannel={handleDeleteChannel} />
            <ChannelDetails
                currentlyUpdatingChannel={state.currentlyUpdatingChannel}
                handleUpdateChannel={handleUpdateChannel}
                onChannelNamenIputChange={onChannelNamenIputChange}
                toggleChannelDetails={toggleChannelDetails} />
            <MetadataModal
              isOpenMetadataModal={state.isOpenMetadataModal}
              metadataKeyInputValue={state.metadataKeyInputValue}
              metadataValueInputValue={state.metadataValueInputValue}
              currentMetadataObject={state.currentMetadataObject}
              updateMetadataObjectItem={updateMetadataObjectItem}
              handleDeleteMetadataObjectItem={handleDeleteMetadataObjectItem}
              onMetadataKeyInputValue={onMetadataKeyInputValue}
              onMetadataValueInputValue={onMetadataValueInputValue}
              addMetadataObjectItem={addMetadataObjectItem}
              saveMetadata={saveMetadata}
              toggleMetadataModal={toggleMetadataModal} />
            <MetacounterModal
              isOpenMetacounterModal={state.isOpenMetacounterModal}
              metacounterKeyInputValue={state.metacounterKeyInputValue}
              metacounterValueInputValue={state.metacounterValueInputValue}
              currentMetacounterObject={state.currentMetacounterObject}
              updateMetacounterObjectItem={updateMetacounterObjectItem}
              handleDeleteMetacounterObjectItem={handleDeleteMetacounterObjectItem}
              onMetacounterKeyInputValue={onMetacounterKeyInputValue}
              onMetacounterValueInputValue={onMetacounterValueInputValue}
              addMetacounterObjectItem={addMetacounterObjectItem}
              saveMetacounter={saveMetacounter}
              toggleMetacounterModal={toggleMetacounterModal} />
            <ChannelCreate
                showChannelCreate={state.showChannelCreate}
                toggleShowCreateChannel={toggleShowCreateChannel}
                onChannelNamenIputChange={onChannelNamenIputChange}
                handleCreateChannel={handleCreateChannel} />
            <Channel
              toggleMetadataModal={toggleMetadataModal}
              toggleMetacounterModal={toggleMetacounterModal}
              currentlyJoinedChannel={state.currentlyJoinedChannel}
              handleLeaveChannel={handleLeaveChannel}>
                <MessagesList
                    messages={state.messages}
                    handleDeleteMessage={handleDeleteMessage}
                    updateMessage={updateMessage}
                />
                <MessageInput
                    value={state.messageInputValue}
                    onChange={onMessageInputChange}
                    sendMessage={sendMessage}
                    fileSelected={state.file}
                    onFileInputChange={onFileInputChange} />
            </Channel>
        </>
    );
};

// Chat UI Components
const ChannelList = ({ channels, handleJoinChannel, toggleShowCreateChannel, handleDeleteChannel, toggleChannelDetails }) => {
    return (
        <div className='channel-list'>
            <div className="channel-type">
                <h1>Open Channels</h1>
                <button className="channel-create-button" onClick={toggleShowCreateChannel}>Create Channel</button>
            </div>
            {
                channels.map(channel => {
                    const userIsOperator = channel.operators.some((operator) => operator.userId === sb.currentUser.userId)
                    return (
                        <div key={channel.url} className="channel-list-item" >
                            <div className="channel-list-item-name"
                                onClick={() => { handleJoinChannel(channel.url) }}>
                                {channel.name}
                            </div>
                            {userIsOperator &&
                                <div>
                                    <button className="control-button" onClick={() => toggleChannelDetails(channel)}>
                                        <img className="channel-icon" src='/icon_edit.png' />

                                    </button>
                                    <button className="control-button" onClick={() => handleDeleteChannel(channel.url)}>
                                        <img className="channel-icon" src='/icon_delete.png' />

                                    </button>
                                </div>}
                        </div>);
                })
            }
        </div >);
}


const Channel = ({ currentlyJoinedChannel, handleLeaveChannel, children, toggleMetadataModal, toggleMetacounterModal }) => {
    if (currentlyJoinedChannel) {
        return <div className="channel">
            <div className="channel-header-wrapper">
              <ChannelHeader>{currentlyJoinedChannel.name}</ChannelHeader>
              <div className="create-metadata-conteiner">
                <h4 className="create-metadata-title">Metadata: </h4>
                <button className="channel-create-button create-metadata-btn" onClick={() => toggleMetadataModal()}>Edit</button>
              </div>
              <div className="create-metadata-conteiner">
                <h4 className="create-metadata-title">Metacounter: </h4>
                <button className="channel-create-button create-metadata-btn" onClick={() => toggleMetacounterModal()}>Edit</button>
              </div>
            </div>
            <div>
                <button className="leave-channel" onClick={handleLeaveChannel}>Exit Channel</button>
            </div>
            <div>{children}</div>
        </div>;

    }
    return <div className="channel"></div>;

}

const ChannelHeader = ({ children }) => {
    return <div className="channel-header">{children}</div>;

}

const MessagesList = ({ messages, handleDeleteMessage, updateMessage }) => {
    return messages.map(message => {
        return (
            <div key={message.messageId} className="oc-message-item">
                <Message
                    handleDeleteMessage={handleDeleteMessage}
                    updateMessage={updateMessage}
                    message={message}
                />
            </div>);
    })
}

const Message = ({ message, updateMessage, handleDeleteMessage }) => {
    if (message.url) {
        return (
            <div className="oc-message">
                <div>{timestampToTime(message.createdAt)}</div>

                <div className="oc-message-sender-name">{message.sender.nickname}{' '}</div>

                <img src={message.url} />
            </div >);
    }

    const messageSentByCurrentUser = message.sender.userId === sb.currentUser.userId;
    return (
        <div className="oc-message">
            <div>{timestampToTime(message.createdAt)}</div>

            <div className="oc-message-sender-name">{message.sender.nickname}{':'}</div>
            <div>{message.message}</div>

            {messageSentByCurrentUser && <>
                <button className="control-button" onClick={() => updateMessage(message)}>
                    <img className="oc-message-icon" src='/icon_edit.png' />
                </button>
                <button className="control-button" onClick={() => handleDeleteMessage(message)}>
                    <img className="oc-message-icon" src='/icon_delete.png' />
                </button>
            </>}


        </div >
    );

}

const MessageInput = ({ value, onChange, sendMessage, onFileInputChange }) => {
    return (
        <div className="message-input">
            <input
                placeholder="write a message"
                value={value}
                onChange={onChange} />

            <div className="message-input-buttons">
                <button className="send-message-button" onClick={sendMessage}>Send Message</button>
                <label className="file-upload-label" htmlFor="upload" >Select File</label>

                <input
                    id="upload"
                    className="file-upload-button"
                    type='file'
                    hidden={true}
                    onChange={onFileInputChange}
                    onClick={() => { }}
                />
            </div>

        </div>);
}

const ChannelDetails = ({
    currentlyUpdatingChannel,
    toggleChannelDetails,
    handleUpdateChannel,
    onChannelNamenIputChange
}) => {
    if (currentlyUpdatingChannel) {
        return <div className="overlay">
            <div className="overlay-content">

                <h3>Update Channel Details</h3>
                <div> Channel name</div>
                <input className="form-input" onChange={onChannelNamenIputChange} />

                <button className="form-button" onClick={() => toggleChannelDetails(null)}>Close</button>

                <button onClick={() => handleUpdateChannel()}>Update channel name</button>
            </div>
        </div >;
    }
    return null;
}

const ChannelCreate = ({
    showChannelCreate,
    toggleShowCreateChannel,
    handleCreateChannel,
    onChannelNamenIputChange
}) => {
    if (showChannelCreate) {
        return <div className="overlay">
            <div className="overlay-content">
                <div>
                    <h3>Create Channel</h3>
                </div>
                <div>Name</div>
                <input className="form-input" onChange={onChannelNamenIputChange} />
                <div>
                    <button className="form-button" onClick={handleCreateChannel}>Create</button>
                    <button className="form-button" onClick={toggleShowCreateChannel}>Cancel</button>
                </div>

            </div>
        </div >;
    }
    return null;
}

const CreateUserForm = ({
    setupUser,
    settingUpUser,
    userNameInputValue,
    userIdInputValue,
    onUserNameInputChange,
    onUserIdInputChange
}) => {
    if (settingUpUser) {
        return <div className="overlay">
            <div className="overlay-content">
                <div>User ID</div>

                <input
                    onChange={onUserIdInputChange}
                    className="form-input"
                    type="text" value={userIdInputValue} />

                <div>User Nickname</div>
                <input
                    onChange={onUserNameInputChange}
                    className="form-input"
                    type="text" value={userNameInputValue} />

                <div>

                    <button
                        className="user-submit-button"
                        onClick={setupUser}>Connect</button>
                </div>
            </div>

        </div>
    } else {
        return null;
    }

}

const MetadataModal = ({ isOpenMetadataModal, toggleMetadataModal, saveMetadata, addMetadataObjectItem, metadataKeyInputValue, onMetadataKeyInputValue, onMetadataValueInputValue, metadataValueInputValue, currentMetadataObject, updateMetadataObjectItem, handleDeleteMetadataObjectItem }) => {
  const isEmpty = Object.keys(currentMetadataObject).length == 0;
  const keys = Object.keys(currentMetadataObject);

  if(isOpenMetadataModal) {
    return(
      <div className="overlay">
          <div className="overlay-content">
            <h3>Manage channel metadata</h3>
            {!isEmpty && keys.map((key) => {
              return (
                <div key={`${key}`} className="metadata-modal-list">
                  <div>{`${key}: `}{`${currentMetadataObject[key]}`}</div>
                  <button className="control-button" onClick={() => updateMetadataObjectItem(key, currentMetadataObject[key])}>
                    <img className="oc-message-icon" src='/icon_edit.png' />
                  </button>
                  <button className="control-button" onClick={() => handleDeleteMetadataObjectItem(key)}>
                    <img className="oc-message-icon" src='/icon_delete.png' />
                  </button>
                </div>
              )
            })}
            <div className="metadata-modal-input">
                <input type="text" placeholder="key" onChange={(e) => onMetadataKeyInputValue(e)} name="key" value={metadataKeyInputValue}></input>
                <input type="text" placeholder="value" onChange={(e) => onMetadataValueInputValue(e)} name="value" value={metadataValueInputValue}></input>
                <button onClick={() => addMetadataObjectItem()}>Add</button>
            </div>
            <button onClick={() => saveMetadata()}>Save</button>
            <button className="form-button" onClick={() => toggleMetadataModal()}>Close</button>
          </div>
      </div>
    )
  }
  return null;
}

const MetacounterModal = ({ isOpenMetacounterModal, toggleMetacounterModal, saveMetacounter, addMetacounterObjectItem, metacounterKeyInputValue, onMetacounterKeyInputValue, onMetacounterValueInputValue, metacounterValueInputValue, currentMetacounterObject, updateMetacounterObjectItem, handleDeleteMetacounterObjectItem }) => {
  const isEmpty = Object.keys(currentMetacounterObject).length == 0;
  const keys = Object.keys(currentMetacounterObject);

  if(isOpenMetacounterModal) {
    return(
      <div className="overlay">
          <div className="overlay-content">
            <h3>Manage channel metacounter</h3>
            {!isEmpty && keys.map((key) => {
              return (
                <div key={`${key}`} className="metadata-modal-list">
                  <div>{`${key}: `}{`${currentMetacounterObject[key]}`}</div>
                  <button className="control-button" onClick={() => updateMetacounterObjectItem(key, currentMetacounterObject[key])}>
                    <img className="oc-message-icon" src='/icon_edit.png' />
                  </button>
                  <button className="control-button" onClick={() => handleDeleteMetacounterObjectItem(key)}>
                    <img className="oc-message-icon" src='/icon_delete.png' />
                  </button>
                </div>
              )
            })}
            <div className="metadata-modal-input">
                <input type="text" placeholder="key" onChange={(e) => onMetacounterKeyInputValue(e)} name="key" value={metacounterKeyInputValue}></input>
                <input type="number" placeholder="value" onChange={(e) => onMetacounterValueInputValue(e)} name="value" value={metacounterValueInputValue}></input>
                <button onClick={() => addMetacounterObjectItem()}>Add</button>
            </div>
            <button onClick={() => saveMetacounter()}>Save</button>
            <button className="form-button" onClick={() => toggleMetacounterModal()}>Close</button>
          </div>
      </div>
    )
  }
  return null;
}


// Helpful functions that call Sendbird
const loadChannels = async () => {
    try {
        const openChannelQuery = sb.openChannel.createOpenChannelListQuery({ limit: 30 });
        const channels = await openChannelQuery.next();
        return [channels, null];

    } catch (error) {
        return [null, error];
    }

}

const joinChannel = async (channel) => {
    try {
        await channel.enter();
        //list all messages
        const messageListParams = new MessageListParams();
        messageListParams.nextResultSize = 20;
        const messages = await channel.getMessagesByTimestamp(0, messageListParams);
        return [channel, messages, null];
    } catch (error) {
        return [null, null, error]
    }
}


const createChannel = async (channelName) => {
    try {
        const openChannelParams = new OpenChannelCreateParams();
        openChannelParams.name = channelName;
        openChannelParams.operatorUserIds = [sb.currentUser.userId];
        const openChannel = await sb.openChannel.createChannel(openChannelParams);
        return [openChannel, null];
    } catch (error) {
        return [null, error];
    }

}

const deleteChannel = async (channelUrl) => {
    try {
        const channel = await sb.openChannel.getChannel(channelUrl);
        await channel.delete();
        return [channel, null];
    } catch (error) {
        return [null, error];
    }

}

const updateChannel = async (currentlyUpdatingChannel, channelNameInputValue) => {
    try {
        const channel = await sb.openChannel.getChannel(currentlyUpdatingChannel.url);
        const openChannelParams = new OpenChannelUpdateParams();
        openChannelParams.name = channelNameInputValue;

        openChannelParams.operatorUserIds = [sb.currentUser.userId];

        const updatedChannel = await channel.updateChannel(openChannelParams);
        return [updatedChannel, null];
    } catch (error) {
        return [null, error];
    }
}

const deleteMessage = async (currentlyJoinedChannel, messageToDelete) => {
    await currentlyJoinedChannel.deleteMessage(messageToDelete);
}

export default OpenChannelMetadataAndMetacounter;