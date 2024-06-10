'use strict';

import { NextApiRequest, NextApiResponse } from "next";

const Player = require('../../db/player');
const connect = require('../../db/connect');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    await connect();
  
    const players = await Player
      .find({ levelsCompleted: { $gt: 0 } })
      .select({ email: 0 })
      .sort({
        levelsCompleted: -1,
        par: 1,
        gameplayTimeMS: 1
      });
    

    return res.status(200).json({ players })
}