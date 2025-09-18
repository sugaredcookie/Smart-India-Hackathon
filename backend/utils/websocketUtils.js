const { wss } = require('../index'); // You'll need to export wss from index.js

// Function to notify users about new community events
function notifyCommunityUpdate(communityId, updateType, data) {
  const message = JSON.stringify({
    type: 'community_update',
    communityId,
    updateType,
    data,
    timestamp: new Date()
  });
  
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      // Check if client is a member of this community
      // This would require storing community memberships in memory or querying DB
      client.send(message);
    }
  });
}

// Function to notify a specific user
function notifyUser(userId, messageType, data) {
  const message = JSON.stringify({
    type: messageType,
    data,
    timestamp: new Date()
  });
  
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN && client.userId === userId) {
      client.send(message);
    }
  });
}

module.exports = {
  notifyCommunityUpdate,
  notifyUser
};