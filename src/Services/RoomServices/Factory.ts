/*
 * ISC License
 *
 * Copyright (c) 2018 Philipp Voß
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 */
import {RoomService as Support} from './Support';

export default (chatModule = 'default') => {
    switch (chatModule) {
        case 'Support':
            return new Support();
    }
    throw new Error("Missing implementation for RoomService: " + chatModule);
}