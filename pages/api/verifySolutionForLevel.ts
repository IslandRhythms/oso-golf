'use strict';

import { NextApiRequest, NextApiResponse } from "next";

const Archetype = require('archetype');
const Player = require('../../db/player');
const assert = require('assert');
const connect = require('../../db/connect');
const levels = require('../../levels');
const oso = require('../../oso');

const VerifySolutionForLevelParams = new Archetype({
  sessionId: {
    $type: 'string',
    $required: true
  },
  level: {
    $type: 'number',
    $required: true,
    $validate: v => assert.ok(v > 0 && v <= levels.length)
  }
}).compile('VerifySolutionForLevelParams');

const constraintsByLevel = require('../../levels').map(level => level.constraints);

const parByLevel = require('../../levels').map(level => level.par);

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
    const { sessionId, level } = new VerifySolutionForLevelParams(req.body);

    await connect();
    
    const player = await Player.findOne({ sessionId }).orFail();
  
    const constraints = constraintsByLevel[level - 1];
    let pass = true;
    for (const constraint of constraints) {
      const resourceId = constraint.resourceType === 'Repository' ?
        `${sessionId}_${constraint.resourceId}` :
        constraint.resourceId;
      const authorized = await oso.authorize(
        { type: 'User', id: `${sessionId}_${constraint.userId}` },
        constraint.action,
        { type: constraint.resourceType, id: resourceId }
      );
      if (authorized !== !constraint.shouldFail) {
        pass = false;
      }
    }
    if (!pass) {
      throw new Error('Did not pass');
    }
  
    const userIds = new Set(constraints.map(constraint => constraint.userId));
    const facts: OsoFact[] = [];
    for (const userId of userIds) {
      const factsForUser = await oso.get(
        'has_role',
        { type: 'User', id: `${sessionId}_${userId}` },
        null,
        null
      );
      facts.push(...factsForUser);
    }
    for (const repo of ['osohq/sample-apps', 'osohq/nodejs-client', 'osohq/configs']) {
      let factsForRepo = await oso.get(
        'is_protected',
        { type: 'Repository', id: `${sessionId}_${repo}` },
        null,
        null
      );
      facts.push(...factsForRepo);
  
      factsForRepo = await oso.get(
        'is_public',
        { type: 'Repository', id: `${sessionId}_${repo}` },
        null,
        null
      );
      facts.push(...factsForRepo);
    }
  
    player.levelsCompleted = player.levelsCompleted + 1;
    player.parPerLevel[level - 1] = facts.length - parByLevel[level - 1];
    player.par = player.parPerLevel.reduce((sum, v) => sum + v);
    player.gameplayTimeMS = Date.now() - player.startTime.valueOf();
    await player.save();

    return res.status(200).json({ player });
}