import {Client} from './Client';

export class Message {

    private _messageType: string = '';
    private _payload: string = '';
    private _messageId: number = 0;

    private _sender: Client = {} as Client;
    private _recipients: Client[] = [];

    constructor() {

    }

    get messageType(): string {
        return this._messageType;
    }

    set messageType(value: string) {
        this._messageType = value;
    }

    get payload(): string {
        return this._payload;
    }

    set payload(value: string) {
        this._payload = value;
    }

    get messageId(): number {
        return this._messageId;
    }

    set messageId(value: number) {
        this._messageId = value;
    }

    get sender(): Client {
        return this._sender;
    }

    set sender(value: Client) {
        this._sender = value;
    }

    get recipients(): Client[] {
        return this._recipients;
    }

    set recipients(value: Client[]) {
        this._recipients = value;
    }

    addRecipient(value: Client) {
        this._recipients.push(value);
    }


};