import http from 'http';
import { createApp } from './app';
import { config } from './config';
import { socketService } from './services/socketService';

const startServer = async () => {
  try {
    const app = createApp();
    const server = http.createServer(app);

    // Initialize real-time WebSockets & WebRTC signaling
    socketService.init(server);

    server.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`🚀 SkillSwap Backend running on http://localhost:${config.port}`);
      console.log(`📡 WebSocket / WebRTC Signaling server initialized`);
      console.log(`🎓 Platform Mode: 100% Free Student Skill Exchange`);
      console.log(`🤖 AI Provider: ${config.ai.provider.toUpperCase()}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start SkillSwap server:', error);
    process.exit(1);
  }
};

startServer();
