import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <div>
        <h1>Basic Code Samples</h1>
        <ul>
          <li><Link to="/open-channel">Basic Open Channel</Link></li>
          <li><Link to="/group-channel">Basic Group Channel</Link></li>
        </ul>
      </div>
      <div>
        <h1>Open Channel Code Samples</h1>
        <ul>
          <li><Link to="/open-channel-send-an-admin-message">Open Channel Send an Admin message</Link></li>
          <li><Link to="/open-channel-message-threading">Open Channel Message Threading</Link></li>
          <li><Link to="/open-channel-copy-message">Open Channel Copy Message</Link></li>
          <li><Link to="/open-channel-send-and-receive-various-types-of-files">Open Channel Send and Receive Various Types of Files</Link></li>
          <li><Link to="/open-channel-display-og-tags">Open Channel Display OG-tags</Link></li>
          <li><Link to="/open-channel-categorize-by-custom-type">Open Channel with Categorize by custom type feature</Link></li>
          <li><Link to="/open-channel-thumbnails">Open Channel with auto generated Thumbnails feature</Link></li>
          <li><Link to="/freeze-open-channel">Open Channel with Freeze feature</Link></li>
          <li><Link to="/open-channel-categorize-messages-by-custom-type">Open Channel with Categorize messages by custom type feature</Link></li>
        </ul>
      </div>
      <div>
        <h1>Group Channel Code Samples</h1>
        <ul>
          <li><Link to="/group-channel-typing-indicator">Group Channel with Typing Indicator</Link></li>
          <li><Link to="/group-channel-message-threading">Group Channel Message Threading</Link></li>
          <li><Link to="/group-channel-send-an-admin-message">Group Channel Send An Admin Message</Link></li>
          <li><Link to="/group-channel-freeze-unfreeze">Group Channel with Freeze feature</Link></li>
          <li><Link to="/group-channel-display-og-tags">Group Channel Display OG-tags</Link></li>
          <li><Link to="/group-channel-react-to-a-message">Group Channel React to a message</Link></li>
          <li><Link to="/group-channel-categorize-by-custom-type">Group Channel with Categorize by custom type feature</Link></li>
          <li><Link to="/group-channel-track-and-cancel">Group Channel with Track and Cancel File upload</Link></li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
