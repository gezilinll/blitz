import { Status, UserPeer, VideoChat, VideoChatWatcher } from './VideoChat';
import { UserAwareness, Whiteboard, WhiteboardWatcher } from './Whiteboard';

export class Room {
    private _whiteboard: Whiteboard;
    private _videoChat: VideoChat;

    constructor() {
        this._whiteboard = new Whiteboard();
        this._videoChat = new VideoChat();
    }

    joinWhiteboard(id: string, user: UserAwareness, watcher?: WhiteboardWatcher) {
        this._whiteboard.join(id, user, watcher);
    }

    joinVideoChat(id: string, userPeer: UserPeer, watcher?: VideoChatWatcher) {
        if (this._videoChat.status === Status.CLOSED) {
            this._videoChat.join(id, userPeer, watcher);
        }
    }

    leaveVideoChat() {
        if (this._videoChat.status === Status.JOINED) {
            this._videoChat.leave();
        }
    }

    updateMousePosition(x: number, y: number) {
        this._whiteboard.updateMousePosition(x, y);
    }

    enableMic() {
        this._videoChat.enableMic();
    }

    disableMic() {
        this._videoChat.disableMic();
    }

    enableCamera() {
        this._videoChat.enableWebcam();
    }

    disableCamera() {
        this._videoChat.disableWebcam();
    }
}