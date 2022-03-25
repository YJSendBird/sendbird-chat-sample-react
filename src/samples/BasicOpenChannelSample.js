import SendBird from 'sendbird';
import { useState, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { SENDBIRD_USER_INFO } from '../constants/constants';
import { timestampToTime } from '../utils/messageUtils';

import SendbirdChat from '../out/sendbird.js';
import { OpenChannelModule, OpenChannelHandler } from '../out/module/openChannel.js';
import { UserMessageParams } from '../out/module/message.js';
import UserMessageUpdateParams from '../out/model/params/userMessageUpdateParams.js';
import OpenChannelCreateParams from '../out/model/params/openChannelCreateParams.js';
import OpenChannelUpdateParams from '../out/model/params/openChannelUpdateParams.js';
import FileMessageParams from '../out/model/params/fileMessageParams.js';

import UserUpdateParams from '../out/model/params/userUpdateParams.js';
import MessageListParams from '../out/model/params/messageListParams.js';

let sb;

const BasicOpenChannelSample = (props) => {

    const [state, updateState] = useState({
        currentlyJoinedChannel: null,
        currentlyUpdatingChannel: null,
        messages: [],
        channels: [],
        showChannelCreate: false,
        messageInputValue: "",
        userNameInputValue: "",
        channelNameInputValue: "",
        settingUpUser: true,
        file: null,
        messageToUpdate: null,
        loading: false,
        error: false
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

        //listen for incoming messages
        const channelHandler = new OpenChannelHandler();
        // channelHandler.onUserEntered = () => { };
        // channelHandler.onOperatorUpdated = () => { };
        // channelHandler.onChannelParticipantCountChanged = () => { };
        channelHandler.onMessageUpdated = (channel, message) => {
            const messageIndex = messages.findIndex((item => item.messageId == message.messageId));
            messages[messageIndex] = message;
            updateState({ ...stateRef.current, messages });

        }

        channelHandler.onMessageReceived = (channel, message) => {
            const updatedMessages = [...messages, message];
            updateState({ ...stateRef.current, messages: updatedMessages });
        };

        sb.openChannel.addOpenChannelHandler(uuid(), channelHandler);
        updateState({ ...state, currentlyJoinedChannel: channel, messages: messages, loading: false })
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
        updateState({ ...state, showChannelCreate: !state.channelCreate });
    }

    const onChannelNamenputChange = (e) => {
        const channelNameInputValue = e.currentTarget.value;
        updateState({ ...state, channelNameInputValue });
    }

    const onUserNameInputChange = (e) => {
        const userNameInputValue = e.currentTarget.value;
        updateState({ ...state, userNameInputValue });
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
            const userMessageParams = new UserMessageParams();
            userMessageParams.message = state.messageInputValue;
            const message = await currentlyJoinedChannel.sendUserMessage(userMessageParams);
            message.onSucceeded((message) => {
                const updatedMessages = [...messages, message];
                updateState({ ...state, messages: updatedMessages, messageInputValue: "" });
            });
        }
    }

    const onFileInputChange = async (e) => {
        if (e.currentTarget.files && e.currentTarget.files.length > 0) {
            const { currentlyJoinedChannel, messages } = state;
            const fileMessageParams = new FileMessageParams();
            fileMessageParams.file = e.currentTarget.files[0];
            const message = await currentlyJoinedChannel.sendFileMessage(fileMessageParams);
            message.onSucceeded((message) => {
                const updatedMessages = [...messages, message];
                updateState({ ...state, messages: updatedMessages, messageInputValue: "", file: null });
            });
        }
    }

    const handleDeleteMessage = async (messageToDelete) => {
        const { currentlyJoinedChannel, messages } = state;
        await deleteMessage(currentlyJoinedChannel, messageToDelete);
        const updatedMessages = messages.filter((message) => {
            return message.messageId !== messageToDelete.messageId;
        });
        updateState({ ...state, messages: updatedMessages });

    }

    const updateMessage = async (message) => {
        updateState({ ...state, messageToUpdate: message, messageInputValue: message.message });
    }

    const setupUser = async () => {
        const { userNameInputValue } = state;
        const sendbirdChat = await SendbirdChat.init({
            appId: SENDBIRD_USER_INFO.appId,
            localCacheEnabled: false,
            modules: [new OpenChannelModule()]
        });

        const userUpdateParams = new UserUpdateParams(SENDBIRD_USER_INFO.nickname);
        userUpdateParams.nickname = userNameInputValue;
        await sendbirdChat.connect(userNameInputValue);
        await sendbirdChat.setChannelInvitationPreference(true);

        await sendbirdChat.updateCurrentUserInfo(userUpdateParams);
        sb = sendbirdChat;
        updateState({ ...state, loading: true });
        const [channels, error] = await loadChannels();
        if (error) {
            return onError(error);
        }
        updateState({ ...state, channels: channels, loading: false, settingUpUser: false });
    }

    if (state.loading) {
        return <div>Loading...</div>
    }

    if (state.error) {
        return <div class="error">{state.error} check console for more information.</div>
    }

    console.log('- - - - State object very useful for debugging - - - -');
    console.log(state);

    return (
        <>
            <CreateUserForm
                setupUser={setupUser}
                userNameInputValue={state.userNameInputValue}
                settingUpUser={state.settingUpUser}
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
                onChannelNamenputChange={onChannelNamenputChange}
                toggleChannelDetails={toggleChannelDetails} />
            <ChannelCreate
                showChannelCreate={state.showChannelCreate}
                toggleShowCreateChannel={toggleShowCreateChannel}
                onChannelNamenputChange={onChannelNamenputChange}
                handleCreateChannel={handleCreateChannel} />
            <Channel currentlyJoinedChannel={state.currentlyJoinedChannel}>
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
                                    <button className="control-button" onClick={() => toggleChannelDetails(channel)}>update</button>
                                    <button className="control-button" onClick={() => handleDeleteChannel(channel.url)}>delete</button>
                                </div>}
                        </div>);
                })
            }
        </div >);
}


const Channel = ({ currentlyJoinedChannel, children }) => {
    if (currentlyJoinedChannel) {
        return <div className="channel">
            <ChannelHeader>{currentlyJoinedChannel.name}</ChannelHeader>
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
            <div key={message.messageId} className="message-item">
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
            <div className="message">
                <div>{timestampToTime(message.createdAt)}</div>
                <img src={message.url} />
            </div >);
    }
    return (
        <div className="message">
            <div className="message-info">
                <div className="message-user-info">
                    <div className="message-sender-name">{message.sender.userId}{' '}</div>
                    <div>{timestampToTime(message.createdAt)}</div>
                </div>
                <div>
                    <button className="control-button" onClick={() => updateMessage(message)}>update</button>
                    <button className="control-button" onClick={() => handleDeleteMessage(message)}>delete</button>
                </div>
            </div>
            <div>{message.message}</div>
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
    onChannelNamenputChange
}) => {
    if (currentlyUpdatingChannel) {
        return <div className="overlay">
            <div className="overlay-content">

                <h3>Update Channel Details</h3>
                <div> Channel name</div>
                <input className="form-input" onChange={onChannelNamenputChange} />

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
    onChannelNamenputChange
}) => {
    if (showChannelCreate) {
        return <div className="overlay">
            <div className="overlay-content">
                <div>
                    <h3>Create Channel</h3>
                </div>
                <div>Name</div>
                <input className="form-input" onChange={onChannelNamenputChange} />
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
    onUserNameInputChange
}) => {
    if (settingUpUser) {
        return <div className="overlay">
            <div className="overlay-content">
                <div>Name</div>
                <input
                    onChange={onUserNameInputChange}
                    className="form-input"
                    type="text" value={userNameInputValue} />
                <div>
                    <button
                        className="user-submit-button"
                        onClick={setupUser}>Submit</button>
                </div>
            </div>

        </div>
    } else {
        return null;
    }

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

export default BasicOpenChannelSample;