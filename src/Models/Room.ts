import {Client} from './Client';

export class Room {

    private _roomId: number;
    private _roomName: string;

    private _creationTime: string;

    private _participants: Client[] = [];

    constructor (roomId: number = 0, roomName: string = '') {
        this._roomId = roomId;
        this._roomName = roomName;
        this._creationTime = new Date().toISOString();
    }


    get roomId(): number {
        return this._roomId;
    }

    set roomId(value: number) {
        this._roomId = value;
    }

    get roomName(): string {
        return this._roomName;
    }

    set roomName(value: string) {
        this._roomName = value;
    }

    get participants(): Client[] {
        return this._participants;
    }

    set participants(value: Client[]) {
        this._participants = value;
    }

    addParticipants(client: Client) {
        this._participants.push(client);
    }
};