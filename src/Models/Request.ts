import {Payload} from './Payload';


export class Request {

    private _messageType: string = '';
    private _payload: Payload = {} as Payload;

    constructor() {
    }

    get messageType(): string {
        return this._messageType;
    }

    set messageType(value: string) {
        this._messageType = value;
    }

    get payload(): Payload {
        return this._payload;
    }

    set payload(value: Payload) {
        this._payload = value;
    }

    static fromJsonString(jsonString: string): Request {
        let request = new Request();
        const data = JSON.parse(jsonString);
        if (data.messageType !== undefined) {
            request.messageType = data.messageType;
        }
        if (data.payload !== undefined) {
            request.payload = new Payload(data.payload);
        }
        return request;
    }
};