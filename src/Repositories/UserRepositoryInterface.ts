import {Client} from "../Models/Client";

interface UserRepositoryInterface {
    getUserByAccessKey(access_key: string): Promise<Client>;
}

export default UserRepositoryInterface;