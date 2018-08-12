/*
 * ISC License
 *
 * Copyright (c) 2018 Philipp Voß
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 */
import {ClientService as Support} from './Support';
import {ClientService as Fate} from './Fate';
import UserRepositoryInterface from "../../Repositories/UserRepositoryInterface";

export default (chatModule = 'default', UserRepository: UserRepositoryInterface) => {
    switch (chatModule) {
        case 'Fate':
            return new Fate(UserRepository);
        case 'Support':
            return new Support(UserRepository);
    }
    throw new Error("Missing implementation for ClientService: " + chatModule);
}