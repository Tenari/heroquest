// Definition of the eventNotices collection

import { Mongo } from 'meteor/mongo';

export const EventNotices = new Mongo.Collection('eventNotices');

// {gameId, userId, message, redirect: 'optional url string to go to after closing the message'}

