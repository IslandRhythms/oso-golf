'use strict';

import { NextApiRequest, NextApiResponse } from "next";

const Archetype = require('archetype');
const oso = require('../../oso');

const AuthorizeParams = new Archetype({
  sessionId: {
    $type: 'string',
    $required: true
  },
  userId: {
    $type: 'string',
    $required: true
  },
  action: {
    $type: 'string',
    $required: true
  },
  resourceType: {
    $type: 'string',
    $required: true
  },
  resourceId: {
    $type: 'string',
    $required: true
  }
}).compile('AuthorizeParams');


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const params = new AuthorizeParams(req.body);
    const authorized = await oso.authorize(
      { type: 'User', id: `${params.sessionId}_${params.userId}` },
      params.action,
      { type: params.resourceType, id: params.resourceId }
    );

    return res.status(200).json({ authorized });
}