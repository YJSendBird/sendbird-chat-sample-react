import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
// Basic samples
import BasicOpenChannelSample from './samples/BasicOpenChannelSample';
import BasicGroupChannelSample from './samples/BasicGroupChannelSample';

// Open channel samples
import OpenChannelCategorizeByCustomType from './samples/OpenChannelCategorizeByCustomType';
import OpenChannelThumbnails from './samples/OpenChannelThumbnails';
import OpenChannelMessageThreading from './samples/OpenChannelMessageThreading';
import OpenChannelSendAnAdminMessage from './samples/OpenChannelSendAnAdminMessage'
import OpenChannelFreeze from './samples/OpenChannelFreeze';
import OpenChannelSendAndReceiveVariousTypesOfFiles from './samples/OpenChannelSendAndReceiveVariousTypesOfFiles'
import OpenChannelCopyMessage from './samples/OpenChannelCopyMessage';
import OpenChannelDisplayOGTags from './samples/OpenChannelDisplayOGTags';
import OpenChannelReportAMessageUserChannel from './samples/OpenChannelReportAMessageUserChannel'
import OpenChannelCategorizeMessagesByCustomType  from './samples/OpenChannelCategorizeMessagesByCustomType';
import OpenChannelStructuredData  from './samples/OpenChannelStructuredData';

// Group channel samples
import GroupChannelTypingIndicatorSample from './samples/GroupChannelTypingIndicatorSample';
import GroupChannelMessageThreading from './samples/GroupChannelMessageThreading'
import GroupChannelSendAnAdminMessage from './samples/GroupChannelSendAnAdminMessage';
import GroupChannelFreezeUnfreeze from './samples/GroupChannelFreezeUnfreeze';
import GroupChannelDisplayOGTags from './samples/GroupChannelDisplayOGTags';
import GroupChannelMarkMessagesAsRead from './samples/GroupChannelMarkMessagesAsRead';
import GroupChannelReactToAMessage from './samples/GroupChannelReactToAMessage';
import GroupChannelCategorizeByCustomType from './samples/GroupChannelCategorizeByCustomType';
import GroupChannelReportAMessageUserChannel from './samples/GroupChannelReportAMessageUserChannel'
import GroupChannelCategorizeMessagesByCustomType  from './samples/GroupChannelCategorizeMessagesByCustomType';
import GroupChannelRetrieveOnlineStatus from './samples/GroupChannelRetrieveOnlineStatus';
import GroupChannelRegisterUnregisterOperator from './samples/GroupChannelRegisterUnregisterOperator';
import GroupChannelLocalCaching from './samples/GroupChannelLocalCaching';
import GroupChannelUpdateDeleteMessageByOperator from './samples/GroupChannelUpdateDeleteMessageByOperator';
import GroupChannelArchive from './samples/GroupChannelArchive'
import GroupChannelMuteUnmuteUsers from './samples/GroupChannelMuteUnmuteUsers';
import GroupChannelBanUnbanUsers from './samples/GroupChannelBanUnbanUsers';
import GroupChannelRetrieveNumberOfMembersHaventReceivedMessage from './samples/GroupChannelRetrieveNumberOfMembersHaventReceivedMessage';
import GroupChannelOperatorsList from './samples/GroupChannelOperatorsList';
import GroupChannelMembersListOrder from './samples/GroupChannelMembersListOrder';
import GroupChannelRetrieveAListOfBannedOrMutedUsers from './samples/GroupChannelRetrieveAListOfBannedOrMutedUsers';
import GroupChannelRetrieveNumberOfMembersHaventReadMessage from './samples/GroupChannelRetrieveNumberOfMembersHaventReadMessage';
import GroupChannelPushNotifications from './samples/GroupChannelPushNotifications';

const App = () => {
  return (
    <div className="container">
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/open-channel' element={<BasicOpenChannelSample />} />
        <Route path='/group-channel' element={<BasicGroupChannelSample />} />
        <Route path='/group-channel-typing-indicator' element={<GroupChannelTypingIndicatorSample />} />
        <Route path='/freeze-open-channel' element={<OpenChannelFreeze />} />
        <Route path='/group-channel-message-threading' element={<GroupChannelMessageThreading />} />
        <Route path='/open-channel-send-an-admin-message' element={<OpenChannelSendAnAdminMessage />} />
        <Route path='/open-channel-message-threading' element={<OpenChannelMessageThreading />} />
        <Route path='/open-channel-copy-message' element={<OpenChannelCopyMessage />} />
        <Route path='/open-channel-send-and-receive-various-types-of-files' element={<OpenChannelSendAndReceiveVariousTypesOfFiles />} />
        <Route path='/group-channel-send-an-admin-message' element={<GroupChannelSendAnAdminMessage />} />
        <Route path='/open-channel-display-og-tags' element={<OpenChannelDisplayOGTags />} />
        <Route path='/group-channel-freeze-unfreeze' element={<GroupChannelFreezeUnfreeze />} />
        <Route path='/group-channel-display-og-tags' element={<GroupChannelDisplayOGTags />} />
        <Route path='/group-channel-react-to-a-message' element={<GroupChannelReactToAMessage />} />
        <Route path='/open-channel-categorize-by-custom-type' element={<OpenChannelCategorizeByCustomType />} />
        <Route path='/open-channel-thumbnails' element={<OpenChannelThumbnails />} />
        <Route path='/open-channel-structured-data' element={<OpenChannelStructuredData />} /> 
        <Route path='/group-channel-mark-messages-as-read' element={<GroupChannelMarkMessagesAsRead />} />
        <Route path='/group-channel-categorize-by-custom-type' element={<GroupChannelCategorizeByCustomType />} />
        <Route path='/open-channel-report-a-message-user-channel' element={<OpenChannelReportAMessageUserChannel />} />
        <Route path='/open-channel-categorize-messages-by-custom-type' element={<OpenChannelCategorizeMessagesByCustomType />} />
        <Route path='/group-channel-report-a-message-user-channel' element={<GroupChannelReportAMessageUserChannel />} />
        <Route path='/group-channel-local-caching' element={<GroupChannelLocalCaching />} />
        <Route path='/group-channel-categorize-messages-by-custom-type' element={<GroupChannelCategorizeMessagesByCustomType />} />
        <Route path='/group-channel-retrieve-online-status' element={<GroupChannelRetrieveOnlineStatus />} />
        <Route path='/group-channel-register-unregister-operator' element={<GroupChannelRegisterUnregisterOperator />} />
        <Route path='/group-channel-update-delete-message-by-operator' element={<GroupChannelUpdateDeleteMessageByOperator />} />
        <Route path='/group-channel-archive' element={<GroupChannelArchive />} />
        <Route path='/group-channel-mute-unmute-users' element={<GroupChannelMuteUnmuteUsers />} />
        <Route path='/group-channel-bun-unban-users' element={<GroupChannelBanUnbanUsers />} />
        <Route path='/group-channel-retrieve-number-of-members-havent-received-message' element={<GroupChannelRetrieveNumberOfMembersHaventReceivedMessage />} />
        <Route path='/group-channel-bun-unban-users' element={<GroupChannelBanUnbanUsers />} /> 
        <Route path='/group-channel-operators-list' element={<GroupChannelOperatorsList />} />
        <Route path='/group-channel-members-list-order' element={<GroupChannelMembersListOrder />} />
        <Route path='/group-channel-retrieve-banned-or-muted-users' element={<GroupChannelRetrieveAListOfBannedOrMutedUsers />} /> 
        <Route path='/group-channel-retrieve-banned-or-muted-users' element={<GroupChannelRetrieveAListOfBannedOrMutedUsers />} />
        <Route path='/group-channel-retrieve-number-of-members-havent-read-message' element={<GroupChannelRetrieveNumberOfMembersHaventReadMessage />} />
        <Route path='/group-channel-push-notifications' element={<GroupChannelPushNotifications />} />
      </Routes>
    </div>
  );
}

export default App;
