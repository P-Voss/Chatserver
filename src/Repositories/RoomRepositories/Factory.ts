/*
 * ISC License
 *
 * Copyright (c) 2018 Philipp Voß
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 */
import {Pool} from 'mysql2';
import {RoomRepository as Support} from './Support';
import {RoomRepository as Fate} from './Fate';
import UserRepositoryInterface from "../RoomRepositoryInterface";

export default (chatModule = 'default', pool: Pool): UserRepositoryInterface => {
    switch (chatModule) {
        case 'Support':
            return new Support(pool);
        case 'Fate':
            return new Fate(pool);
    }
    throw new Error("Missing implementation for UserRepository: " + chatModule);
};