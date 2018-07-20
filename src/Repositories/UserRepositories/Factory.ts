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
import {UserRepository as support} from './Support';
import UserRepositoryInterface from "../UserRepositoryInterface";

export default (chatModule = 'default', pool: Pool): UserRepositoryInterface => {
    switch (chatModule) {
        case 'Support':
            return new support(pool);
    }
    throw new Error("Missing implementation for UserRepository: " + chatModule);
};