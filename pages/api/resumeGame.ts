'use strict';

import { NextApiRequest, NextApiResponse } from "next";

const Archetype = require('archetype');
const Player = require('../../db/player');
const connect = require('../../db/connect');

const ResumeGameParams = new Archetype({
  sessionId: {
    $type: 'string',
    $required: true
  }
}).compile('ResumeGameParams');


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { sessionId } = new ResumeGameParams(req.body);

    await connect();
    
    const player = await Player.findOne({
      sessionId
    });

    return res.status(200).json({ player });
}