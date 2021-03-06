require('dotenv').config();
const sleep = require('p-sleep');
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { stringToU8a, u8aToHex } = require('@polkadot/util');

const rootPrivkey = process.env.ROOT_PRIVKEY;
const userPrivkey = process.env.USER_PRIVKEY;
const overlordPrivkey = process.env.OVERLOAD_PRIVKEY;
const ferdiePrivkey = process.env.FERDIE_PRIVKEY;
const charliePrivkey = process.env.CHARLIE_PRIVKEY;
const davidPrivkey = process.env.DAVID_PRIVKEY;
const evePrivkey = process.env.EVE_PRIVKEY;
const endpoint = process.env.ENDPOINT;

async function main() {
    const wsProvider = new WsProvider(endpoint);
    const api = await ApiPromise.create({
        provider: wsProvider,
        types: {
            RaceType: {
                _enum: ['Cyborg', 'AISpectre', 'XGene', 'Pandroid']
            },
            CareerType: {
                _enum: ['HardwareDruid', 'RoboWarrior', 'TradeNegotiator', 'HackerWizard', 'Web3Monk']
            },
            StatusType: {
                _enum: ['ClaimSpirits', 'PurchaseRareOriginOfShells', 'PurchasePrimeOriginOfShells', 'PreorderOriginOfShells']
            },
            RarityType: {
                _enum: ['Prime', 'Magic', 'Legendary']
            },
            PreorderInfo: {
                owner: "AccountId",
                race: "RaceType",
                career: "CareerType",
                metadata: "BoundedString",
            },
            NftSaleInfo: {
                race_count: "u32",
                race_for_sale_count: "u32",
                race_giveaway_count: "u32",
                race_reserved_count: "u32",
            },
            Purpose: {
                _enum: ['RedeemSpirit', 'BuyPrimeOriginOfShells']
            },
            OverlordMessage: {
                account: "AccountId",
                purpose: "Purpose",
            },
        }
    });
    const keyring = new Keyring({type: 'sr25519'});

    const root = keyring.addFromUri(rootPrivkey);
    const user = keyring.addFromUri(userPrivkey);
    const ferdie = keyring.addFromUri(ferdiePrivkey);
    const overlord = keyring.addFromUri(overlordPrivkey);
    const charlie = keyring.addFromUri(charliePrivkey);
    const david = keyring.addFromUri(davidPrivkey);
    const eve = keyring.addFromUri(evePrivkey);

    // StatusType
    const claimSpirits = api.createType('StatusType', 'ClaimSpirits');
    const purchaseRareOriginOfShells = api.createType('StatusType', 'PurchaseRareOriginOfShells');
    const purchasePrimeOriginOfShells = api.createType('StatusType', 'PurchasePrimeOriginOfShells');
    const preorderOriginOfShells = api.createType('StatusType', 'PreorderOriginOfShells');

    // RarityTypes
    const legendary = api.createType('RarityType', 'Legendary');
    const magic = api.createType('RarityType', 'Magic');
    const prime = api.createType('RarityType', 'Prime');

    // RaceTypes
    const cyborg = api.createType('RaceType', 'Cyborg');
    const aiSpectre = api.createType('RaceType', 'AISpectre');
    const xGene = api.createType('RaceType', 'XGene');
    const pandroid = api.createType('RaceType', 'Pandroid');

    // CareerTypes
    const hardwareDruid = api.createType('CareerType', 'HardwareDruid');
    const roboWarrior = api.createType('CareerType', 'RoboWarrior');
    const tradeNegotiator = api.createType('CareerType', 'TradeNegotiator');
    const hackerWizard = api.createType('CareerType', 'HackerWizard');
    const web3Monk = api.createType('CareerType', 'Web3Monk');


    // // produce whitelist
    // {
    //   const claimer = user.address;
    //   const metadata = '0xDEADBEEF';
    //   const message = api.createType('(AccountId,Vec<u8>)', [claimer, metadata]);
    //   const sig = overlord.sign(message.toU8a());
    //   u8aToHex(sig);
    //   console.log(sig)
    // }
    // return;

    // Create OverlordMessage for RedeemSpirit
    {
        const purpose = api.createType('Purpose', 'RedeemSpirit');
        const overlordMessage = api.createType('OverlordMessage', {'account': ferdie.address, 'purpose': purpose});
        const metadataSig = overlord.sign(overlordMessage.toU8a());
        //const isValid = overlord.verify(overlordMessage, metadataSig, overlord.publicKey);

        // Mint a Spirit
        //await api.tx.pwNftSale.claimSpirit().signAndSend(user);
        await api.tx.pwNftSale.redeemSpirit(metadataSig).signAndSend(ferdie);
    }

    // mint spirit nft
    {
        // const serialId = 1;
        // const signature = '0xAABB';
        // const metadata = '0xCCDD'
        // const metadataSig = overlord.sign(metadata);
        // u8aToHex(metadataSig);
        // await api.tx.pwNftSale.claimSpirit(null, nftSignedMetadata).signAndSend(user);
    }

    // purchase rare origin of shell
    {
        // RarityType ['Legendary', 'Magic', 'Prime']
        // RaceType ['AISpectre', 'Cyborg', 'Pandroid', 'XGene']
        // CareerType ['HardwareDruid', 'HackerWizard', 'RoboWarrior', 'TradeNegotiator', 'Web3Monk']
        // metadata '0x2813308004'
        // const metadataSig = overlord.sign(metadata);
        // u8aToHex(metadataSig);
        await api.tx.pwNftSale.buyRareOriginOfShell('Legendary', 'Cyborg', 'HackerWizard')
            .signAndSend(user);
    }

    // purchase whitelist prime origin of shell
    {
        // RaceType ['AISpectre', 'Cyborg', 'Pandroid', 'XGene']
        // CareerType ['HardwareDruid', 'HackerWizard', 'RoboWarrior', 'TradeNegotiator', 'Web3Monk']
        // whitelistClaim createType('(AccountId,Vec<u8>)', [claimer, metadata]);
        // const sig = overlord.sign(message.toU8a());
        // u8aToHex(sig);
        // metadata '0x2813308004'
        // const metadataSig = overlord.sign(metadata);
        // u8aToHex(metadataSig);
        const purpose = api.createType('Purpose', 'BuyPrimeOriginOfShells');
        const overlordMessage = api.createType('OverlordMessage', {'account': ferdie.address, 'purpose': purpose});
        const overlordSig = overlord.sign(overlordMessage.toU8a());

        //await api.tx.pwNftSale.setStatusType(true, 'PurchasePrimeOriginOfShells')
        //    .signAndSend(overlord, {nonce: -1});
        // Mint Prime Origin of Shell
        await api.tx.pwNftSale.buyPrimeOriginOfShell(overlordSig, 'Cyborg', 'HackerWizard')
            .signAndSend(ferdie);
    }

    // preorder origin of shell
    {
        // RaceType ['AISpectre', 'Cyborg', 'Pandroid', 'XGene']
        // CareerType ['HardwareDruid', 'HackerWizard', 'RoboWarrior', 'TradeNegotiator', 'Web3Monk']
        await api.tx.pwNftSale.preorderOriginOfShell('Pandroid', 'HackerWizard')
            .signAndSend(ferdie);
    }

    // privileged function to mint chosen preorders
    {
        const chosenPreorders = api.createType('Vec<u32>', [0, 1, 2, 4, 10, 6, 12, 11]);
        await api.tx.pwNftSale.mintChosenPreorders(chosenPreorders)
            .signAndSend(overlord);
    }

    // privileged function to refund not chosen preorders
    {
        const notChosenPreorders = api.createType('Vec<u32>', [7, 3, 5, 8, 9, 13]);
        await api.tx.pwNftSale.refundNotChosenPreorders(notChosenPreorders)
            .signAndSend(overlord);
    }

    // Update the Prime Origin of Shell NFTs based on the number of Whitelist NFTs claimed
    // This is called AFTER the Whitelist Sale is complete. Must Disable Whitelist sale before updating to ensure numbers
    // do not fluctuate.
    {
        await api.tx.pwNftSale.updateRarityTypeCounts('Prime', 900, 50)
            .signAndSend(overlord);
    }

    // Enable Incubation process and start the incubation phase
    {
        await api.tx.pwIncubation.setCanStartIncubationStatus(true)
            .signAndSend(overlord);
    }

    // Feed an Origin of Shell. feedOriginOfShell(CollectionId, NftId)
    {
        await api.tx.pwIncubation.feedOriginOfShell(1, 0).signAndSend(ferdie);
    }

    // Update Origin of Shells Hatch Times. Send Vec of the top 10 ((CollectionId, NftId), u64) with the time reduction in seconds.
    {
        const originOfShells = api.createType('Vec<((u32,u32), u64)>', [[[1, 1], 10800], [[1,0], 7200], [[1, 3], 3600], [[1,2], 2400], [[1, 0], 2400], [[1, 4], 1400], [[1, 5], 1400], [[1, 8], 1400], [[1, 10], 1400]]);
        await api.tx.pwIncubation.updateIncubationTime(originOfShells).signAndSend(overlord);
    }

    // Mint a gift NFT of either NftSaleType of Giveaway or Reserved
    {
        await api.tx.pwNftSale.mintGiftOriginOfShell(ferdie.address, 'Prime', 'Cyborg', 'HackerWizard', 'Giveaway')
            .signAndSend(overlord);
        await api.tx.pwNftSale.mintGiftOriginOfShell(charlie.address, 'Legendary', 'AISpectre', 'Web3Monk', 'Reserved')
            .signAndSend(overlord);
    }

    // Hatch origin of shell executed by Overlord
    // hatchOriginOfShell parameters
    // - owner: AccountId of the Origin of Shell to Hatch
    // - collectionId: Collection ID of the Origin of Shell
    // - nftId: NFT ID of the Origin of Shell
    // - metadata: URI pointing to the File resource of the Shell NFT in decentralized storage
    {
        const metadata = api.createType('BoundedVec<u8, <T as pallet_uniques::Config>::StringLimit>', "https://a2l45nwayr2ij5g7aypdjw7sq2i4eceuowszzeqjw54fr3wu.arweave.net/BpfOtsDEdIT03wYeNNvy-hpHCCJR1pZySCbd4WO-7Uw/");
        await api.tx.pwIncubation.hatchOriginOfShell(ferdie.address, 1, 0, metadata).signAndSend(overlord);
    }

    // Query an Era's fed Origin of Shells, Generate top 10 fed, reduce top 10 Origin of Shells hatch times in seconds
    {
        const currentEra = await api.query.pwNftSale.era();
        console.log(`Current Era: ${currentEra}`);
        // Times fed in era 0 for the [collectionId, nftId], era
        const originOfShellFoodStats = await api.query.pwIncubation.originOfShellFoodStats.entries(currentEra.toNumber());

        const sortedOriginOfShellStats = originOfShellFoodStats
            .map(([key, value]) => {
                    const eraId = key.args[0].toNumber()
                    const collectionIdNftId = key.args[1].toHuman()
                    const numTimesFed = value.toNumber()
                    return {
                        eraId: eraId,
                        collectionIdNftId: collectionIdNftId,
                        numTimesFed: numTimesFed
                    }
                }
            ).sort((a, b) => b.numTimesFed - a.numTimesFed);
        console.log(sortedOriginOfShellStats.slice(0,10));
        let reduceHatchTimeSeconds = [10800, 7200, 3600, 2400, 1400, 1400, 1400, 1400, 1400, 1400]
        let topTenFed = [];
        let i = 0;
        for (const nftStats in sortedOriginOfShellStats) {
            topTenFed[i] = api.createType('((u32, u32), u64)', [sortedOriginOfShellStats[nftStats].collectionIdNftId, reduceHatchTimeSeconds[i]]);
            i++
        }
        console.log(topTenFed.toString());
        await api.tx.pwIncubation.updateIncubationTime(topTenFed).signAndSend(overlord, { nonce: nonceOverlord++ });
    }

    // Add a Basic Resource to an NFT
    {
        const spiritCollectionId = await api.query.pwNftSale.spiritCollectionId();
        if (spiritCollectionId.isSome) {
            console.log(`Adding Basic Resource...`);
            await api.tx.rmrkCore.addBasicResource(spiritCollectionId.unwrap(), 0, {
                'src': null,
                'metadata': 'ar://YV4TWufBJZtpRc-7BkgzvaM7eN2Y5xZcZ3uFbplN-L4',
                'license': null,
                'thumb': null
            }).signAndSend(overlord)
            console.log(`Adding Basic Resource...Done`);
            const pendingResource = await api.query.rmrkCore.resources(spiritCollectionId.unwrap(), 0, 0)
            console.log(`Resource Added: ${pendingResource}`)
        }
    }

    // Accept a Resource that was added to an NFT
    {
        const spiritCollectionId = await api.query.pwNftSale.spiritCollectionId();
        if (spiritCollectionId.isSome) {
            console.log(`Accepting Basic Resource...`);
            await api.tx.rmrkCore.acceptResource(spiritCollectionId.unwrap(), 0, 0).signAndSend(alice)
            console.log(`Accepting Basic Resource...Done`);
            const pendingResource = await api.query.rmrkCore.resources(spiritCollectionId.unwrap(), 0, 0)
            console.log(`Resource Added: ${pendingResource}`)
        }
    }

}
