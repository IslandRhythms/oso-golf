'use strict';

import { NextApiRequest, NextApiResponse } from "next";

const Archetype = require('archetype');
const oso = require('../../oso');

const FactsParams = new Archetype({
  sessionId: {
    $type: 'string',
    $required: true
  },
  userId: {
    $type: ['string'],
    $required: true
  }
}).compile('FactsParams');

type OsoFact = {
    // Define the shape of the fact object based on what oso.get returns
    // For example:
    type: string;
    id: string;
    // Add other properties as needed
  };
  
  type OsoInstance = {
    get: (
      rule: string,
      args1: { type: string, id: string },
      args2: null | undefined,
      args3: null | undefined
    ) => Promise<OsoFact[]>;
  };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const params = new FactsParams(req.body);
    const facts: OsoFact[] = [];
    for (const userId of params.userId) {
      const factsForUser = await (oso as OsoInstance).get(
        'has_role',
        { type: 'User', id: `${params.sessionId}_${userId}` },
        null,
        null
      );
      facts.push(...factsForUser);
    }
    for (const repo of ['osohq/sample-apps', 'osohq/nodejs-client', 'osohq/configs']) {
      let factsForRepo = await oso.get(
        'is_protected',
        { type: 'Repository', id: `${params.sessionId}_${repo}` },
        null,
        null
      );
      facts.push(...factsForRepo);
  
      factsForRepo = await oso.get(
        'is_public',
        { type: 'Repository', id: `${params.sessionId}_${repo}` },
        null,
        null
      );
      facts.push(...factsForRepo);
    }
    
    return res.status(200).json({ facts });
}