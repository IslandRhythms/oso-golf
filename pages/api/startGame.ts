'use strict';

import { NextApiRequest, NextApiResponse } from "next";

const Archetype = require('archetype');
const Player = require('../../db/player');
const connect = require('../../db/connect');
const oso = require('../../oso');

const StartGameParams = new Archetype({
  sessionId: {
    $type: 'string',
    $required: true
  },
  name: {
    $type: 'string',
    $required: true
  },
  email: {
    $type: 'string',
    $required: true
  }
}).compile('StartGameParams');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { sessionId, name, email } = new StartGameParams(req.body);

    await connect();
    
    const player = await Player.create({
      sessionId,
      name,
      email
    });
  
    await oso.tell(
      'has_relation',
      { type: 'Repository', id: `${sessionId}_osohq/configs` },
      'organization',
      { type: 'Organization', id: 'osohq' }
    );
  
    await oso.tell(
      'has_relation',
      { type: 'Repository', id: `${sessionId}_osohq/sample-apps` },
      'organization',
      { type: 'Organization', id: 'osohq' }
    );
  
    await oso.tell(
      'has_relation',
      { type: 'Repository', id: `${sessionId}_osohq/nodejs-client` },
      'organization',
      { type: 'Organization', id: 'osohq' }
    );
    

    return res.status(200).json({ player })
}