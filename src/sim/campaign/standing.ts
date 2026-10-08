import type { Campaign } from './types';

// Where a player stands decides what lands on their desk. There are four places to stand, and an event is written for one or
// more of them, so that nobody is asked to "declare a state of emergency" from the opposition benches, or to "table a motion"
// from a seat in the cabinet:
//   pm    leading the government
//   gov   a partner in the government, not leading it
//   lead  leading the opposition: the largest party outside the government
//   opp   in opposition, but not leading it

export const STANDINGS = ['pm', 'gov', 'lead', 'opp'] as const;
export type Standing = (typeof STANDINGS)[number];

/** Where the player stands now. In opposition, "lead" is the largest party outside the government, as noted each week of the term. */
export function standingOf(c: Campaign): Standing {
  const k = c.career!;
  const g = k.government;
  if (g.pm === c.player) return k.limited ? 'gov' : 'pm';
  if (g.partners.includes(c.player)) return 'gov';
  // Until the first week of a term has told who leads the opposition (a game just loaded, say), an opposition party leads it.
  return k.oppLeader === undefined || k.oppLeader === c.player ? 'lead' : 'opp';
}

const ALL: Standing[] = ['pm', 'gov', 'lead', 'opp'];
const GOVERNING: Standing[] = ['pm', 'gov'];
const FROM_ROLE: Record<string, Standing[]> = { any: ALL, gov: GOVERNING, partner: ['gov'], pm: ['pm'], opp: ['lead', 'opp'] };

/**
 * The events written before there were four places to stand were told in one voice for everyone. Where that voice was the
 * government's (a cap on prices, a ruling on a licence, a subsidy) it is kept to those who govern, and the opposition has its
 * own telling of the same trouble in the newer lists.
 */
export const GOVERNING_ONLY: readonly string[] = [
  'gigInsurance', 'trawlers', 'heritageHouse', 'hawkerLicence', 'ferryStops', 'cropGlut', 'trafficJam', 'tuitionCentres',
  'priceSurge', 'flashFloods', 'mayorRow', 'fedGrantCut', 'fedTalks', 'fedSettlement', 'haze', 'subsidyReform',
  'borneoHighway', 'bridgeContract', 'bridgeOpening', 'fundProbe', 'fundTrial', 'budgetAsk',
];

/** The places an event may come to, from what it says of itself. */
export function seatsOfEvent(id: string, def: { role: string; seats?: Standing[] }): readonly Standing[] {
  if (def.seats) return def.seats;
  if (GOVERNING_ONLY.includes(id)) return GOVERNING;
  return FROM_ROLE[def.role] ?? ALL;
}

/** Whether an event could come to a player standing here. */
export const forStanding = (id: string, def: { role: string; seats?: Standing[] }, at: Standing): boolean => seatsOfEvent(id, def).includes(at);

/** The kinds of trouble, so that one kind does not come twice running. An event not listed stands as its own kind. */
export const TOPICS: Record<string, string> = {};
const kind = (topic: string, ids: string) => { for (const id of ids.split(/\s+/).filter(Boolean)) TOPICS[id] = topic; };
kind('cost', 'nasiLemakPrice priceSurge pricesGov pricesOpp riceShortage riceShort ricePrice riceInquiry subsidyReform tolls electricityTariff cropGlut gigInsurance riders gigStrike pensionCall ringgitSlide');
kind('economy', 'downgrade downturnGov downturnOpp firmWindfall firmBust windfall ratingsWarning budget budgetRevolt budgetAsk shadowBudget megaProject investorDelegation tradeDispute sanctionsThreat visaFree carbonRule consultants');
kind('media', 'oldVideo podcast talkShow deepfake editorDinner newsroomRaid filmBan influencer memeWar tongueSlip newsPortal danceTrend whatsappLeak fakeNewsLaw roguePoll speechwriter papersStory fixerProfile');
kind('party', 'youthWing warlord deputy assemblyFight assemblyCalm partyPolls branchBrawl defectorsKnock merchandise oldGuard topTable youthQuota founderMemoir twoBranches youngTalent veteranMp billboardSponsor womensQuota memberApp hallFire partyAnniversary internRevolt staffPoached staffLeak');
kind('scandal', 'accountsLeak donorFavour donorLeak probe targeted papers papersBook bridgeContract youthFund youthFundProbe youthFundVerdict sovereignFund fundProbe fundTrial fundGov fundGovEnd fundOpp fundOppEnd auditReport custodyDeath whistleblower courtCase tycoonAudit tycoonFriends stateBanquet airMiles ministerScandal minister cabinetLeak acquittal');
kind('house', 'motion ultimatum walkoutThreat plotWhispers hotelMeeting hotelNumbers hotelAftermath speakerRuling houseWalkout sharpQuestion shadowCabinet adviserUltimatum ksuMemo');
kind('local', 'potholes shophouses marketScolding hawkerLicence nightMarket trafficJam heritageHouse strayCats openHouse cityHousing mayorRow');
kind('nation', 'wardsFull outbreak examResults examLeak campusProtest teacherStrike schoolMeals tuitionCentres foreignCampus scamCalls');
kind('abroad', 'seaIncident mediationAward summitHost refugeeBoats twoPowers borderStandoff strandedAbroad technocratOffer');
kind('federation', 'borneoThird oilRights borneoHighway peninsulaGaffe stateDefiance royaltiesRow palaceConcern claimsTalks claimsStalled claimsVerdict fedGrantCut fedTalks fedSettlement ferryStops');
kind('weather', 'flood monsoon flashFloods dryTaps haze bridge bridgeOpening fishKill riverFactory riverCourt');
kind('life', 'durianFeast footballFinal goldMedal danceTrend');

kind('coalition', 'cabinetReshuffle seatTalks juniorCredit postsForMine outvoted unpopularBill crossoverOffer partnerMinisterRow allocationFight posterLogo mergerOffer trailingInCoalition budgetShare coalitionSummit stateSeatSwap leverageFile honoursList restlessMembers wooPartner crossoverHints ministryOffer govtCourts swingVotes trappedVote');
kind('economy', 'giveawayBudget emergencyPowers nationalAddress payReview inflationCommittee taxPledge govtFumbles budgetTip railStrike');
kind('house', 'censureMotion bipartisanOffer inquiryCall speakerBars resignCalls speakingTime shadowGaffe ethicsComplaint');
kind('party', 'whispersAgainstYou leadFreeze seatDealLead mergerInvite defectionYours shadowPortfolio borrowedLogo volunteerShortage mpAllowance healthRumour judicialPanel');
kind('campaign', 'mediaBlackout creditRow pollLead nationalMourning millionPetition massRally endorsement donorSmall');
kind('local', 'constituencyClinic constituencyFlood localProtest councilWin nicheCause showcaseState');
kind('abroad', 'stateVisit foreignInvite');
kind('scandal', 'civilServantFile');

/** The kind of trouble
/** The kind of trouble an event is: its own say, or what it is listed under, or itself. */
export const topicOf = (id: string, def: { topic?: string }): string => def.topic ?? TOPICS[id] ?? id;
/** Weeks for which the kind of trouble that has just come is less likely to come again. */
export const COOL_WEEKS = 20;
/** How much less likely, while it cools. */
export const COOL_FACTOR = 0.25;
/** How much likelier an event written for one or two of the four places is than one told to everybody. */
export const OWN_PLACE = 2;
/** How much less likely an event is for each term in which it has already come. */
export const SEEN_FACTOR = 0.3;
