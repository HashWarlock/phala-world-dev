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
            }
        }
    });
    const keyring = new Keyring({ type: 'sr25519' });

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

    // list spirit
    {
        const spiritCollectionId = await api.query.pwNftSale.spiritCollectionId();
        if (spiritCollectionId.isSome) {
            const spirit = await api.query.uniques.account.entries(user.address, spiritCollectionId.unwrap());
            spirit
                .map(([key, _value]) =>
                    [key.args[0].toString(), key.args[1].toNumber(), key.args[2].toNumber()]
                ).forEach(([account, collectionId, nftId]) => {
                console.log({
                    account,
                    collectionId,
                    nftId,
                })
            })
        } else {
            throw new Error(
                'Spirit Collection ID not configured'
            )
        }
    }

    // list origin of shells
    {
        const originOfShellCollectionId = await api.query.pwNftSale.originOfShellCollectionId();
        if (originOfShellCollectionId.isSome) {
            const originOfShells = await api.query.rmrkCore.nfts.entries(originOfShellCollectionId.unwrap());
            originOfShells
                .map(([key, value]) =>
                    [key.args[0].toNumber(), key.args[1].toNumber(), value.toHuman()]
                ).forEach(([collectionId, nftId, nftInfo]) => {
                console.log({
                    collectionId,
                    nftId,
                    nftInfo,
                })
            })
        } else {
            throw new Error(
                'Origin of Shell Collection ID not configured'
            )
        }
    }

    // Get NFT attributes
    {
        const col = 1;
        const rol = api.createType('Option<u32>', 0);
        const attributes = await api.query.uniques.attribute.entries(col, rol);
        attributes
            .map(([key, value]) =>
                [key.args[0].toNumber(), key.args[1].unwrap().toNumber(), key.args[2].toHuman(), value.unwrap()[0].toHuman()]
            ).forEach(([collection, nft, attr, val]) => {
            console.log({
                collection,
                nft,
                attr,
                val
            })
        })
    }

    // Get RaceType
    {
        const collectionId = 1;
        const nftId = api.createType('Option<u32>', 0);
        const race = api.createType('BoundedVec<u8, T::KeyLimit>', 'race')
        const attribute = await api.query.uniques.attribute(collectionId, nftId, race);
        if (attribute.isSome) {
            const nftAttribute = api.createType('RaceType', attribute.unwrap()[0].toHuman());
            console.log(`Attribute race for Origin of Shell NFT ID ${nftId}: ${nftAttribute}`);
        } else {
            throw new Error(
                'Origin of Shell race attribute not configured'
            )
        }
    }

    // Get CareerType
    {
        const collectionId = 1;
        const nftId = api.createType('Option<u32>', 0);
        const career = api.createType('BoundedVec<u8, T::KeyLimit>', 'career')
        const attribute = await api.query.uniques.attribute(collectionId, nftId, career);
        if (attribute.isSome) {
            const nftAttribute = api.createType('CareerType', attribute.unwrap()[0].toHuman());
            console.log(`Attribute career for Origin of Shell NFT ID ${nftId}: ${nftAttribute}`);
        } else {
            throw new Error(
                'Origin of Shell career attribute not configured'
            )
        }
    }

    // List all preorders before drawing winners
    {
        const preorderIndex = await api.query.pwNftSale.preorderIndex();
        console.log(`Current preorder index: ${preorderIndex}`);
        const preorderKeys = await api.query.pwNftSale.preorders.entries();
        preorderKeys
            .map(([key, value]) =>
                [key.args[0].toNumber(), value.toHuman()]
            ).forEach(([preorderId, preorderInfo]) => {
            console.log({
                preorderId,
                preorderInfo,
            })
        })
    }

    // List of Preorder ids for a user
    // Example output
    // {
    //     account: '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL',
    //         preorderId: 0,
    //     preorderInfo: {
    //     owner: '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL',
    //         race: 'Pandroid',
    //         career: 'HackerWizard',
    //         metadata: 'I am Prime',
    //      }
    // }
    {
        async function getPreordersByOwner(khalaApi, owner) {
            const preorderIndex = await api.query.pwNftSale.preorderIndex();
            console.log(`Current preorder index: ${preorderIndex}`);
            const preorderKeys = await api.query.pwNftSale.preorders.entries();
            for(const preorder in preorderKeys) {
                const preorderInfo = await api.query.pwNftSale.preorders(preorder);
                if (preorderInfo.isSome) {
                    const preorderInfoVal = preorderInfo.unwrap();
                    if (preorderInfoVal.owner.eq(owner)) {
                        console.log(preorderInfoVal.toHuman());
                    }
                }
            }
        }
        await getPreordersByOwner(api, '43qxXkmiThNSx1DXm2YdfPe6jioBBEELRFNnbgZGwgZeei8X');
    }


    // List the current Era
    {
        const currentEra = await api.query.pwNftSale.era();
        console.log(`Current era: ${currentEra}`);
    }

    // List Zero Day Timestamp
    {
        const zeroDayTimestamp = await api.query.pwNftSale.zeroDay();
        console.log(`Zero Day: ${zeroDayTimestamp}`);
    }

    // List all OriginOfShellsInventory
    {
        const originOfShellsInventoryLegendary = await api.query.pwNftSale.OriginOfShellsInventory.keys('Legendary');
        originOfShellsInventoryLegendary.forEach(([{ args: race }, _value]) => {
           console.log(`Rarity Type: Legendary\nRace Type: {}`)
        });
    }

    // Can users claim spirit?
    {
        const canClaimSpirits = await api.query.pwNftSale.canClaimSpirits();
        console.log(`Can claim spirit states: ${canClaimSpirits}`);
    }

    // Can users purchase rare origin of shell?
    {
        const canPurchaseRareOriginOfShells = await api.query.pwNftSale.canPurchaseRareOriginOfShells();
        console.log(`Can purchase rare origin of shells: ${canPurchaseRareOriginOfShells}`);
    }

    // Can users on whitelist purchase prime origin of shell?
    {
        const canPurchaseHer0OriginOfShells = await api.query.pwNftSale.canPurchasePrimeOriginOfShells();
        console.log(`Can whitelist purchase prime origin of shells: ${canPurchaseHer0OriginOfShells}`);
    }

    // Can users preorder origin of shell?
    {
        const canPreorderOriginOfShells = await api.query.pwNftSale.canPreorderOriginOfShells();
        console.log(`Can preorder origin of shells: ${canPreorderOriginOfShells}`);
    }

    // Is last day of sale?
    {
        const isLastDayOfSale = await api.query.pwNftSale.lastDayOfSale();
        console.log(`Is last day of sale: ${isLastDayOfSale}`);
    }

    // Check if Incubation Process has started
    {
        const canStartIncubation = await api.query.pwIncubation.canStartIncubation();
        console.log(`Can start incubation process: ${canStartIncubation}`);
    }

    // Get Hatch Times
    {
        const currentEra = await api.query.pwNftSale.era();
        console.log(`Current Era: ${currentEra}`);
        // hatchTimes for the Collection ID
        const hatchTimes = await api.query.pwIncubation.hatchTimes.entries(1);
        hatchTimes
            .map(([key, value]) =>
                [key.args[0].toString(), key.args[1].toNumber(), value.toHuman()]
            ).forEach(([collectionId, nftId, timestamp]) => {
            console.log({
                collectionId,
                nftId,
                timestamp,
            })
        })
    }

    // Query the Origin of Shell Stats in Current Era, Sort the results and print top 10
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
                        eraId,
                        collectionIdNftId,
                        numTimesFed
                    }
                }
            ).sort((a, b) => b.numTimesFed - a.numTimesFed);
        console.log(sortedOriginOfShellStats.slice(0,10));
    }
    // Get total feeding stats for a NFT
    {
        async function getOriginOfShellTotalFed(khalaApi, collectionId, nftId) {
            let totalFed = 0;
            let currentEraQuery = await api.query.pwNftSale.era();
            let currentEra = currentEraQuery.toNumber();
            for (currentEra; currentEra >= 0; currentEra--) {
                const originOfShellFoodStats = await api.query.pwIncubation.originOfShellFoodStats(currentEra, [collectionId, nftId]);
                totalFed += originOfShellFoodStats.toNumber()
            }
            console.log(`Total Fed: ${totalFed}`);
        }

        await getOriginOfShellTotalFed(api, 1, 1);
    }

    // Filter on attributes & display NFTs
    {
        async function filterOriginShellsByAttribute(khalaApi, attrType, attrKey, attrValue) {
            let nftIdsArr = [];
            const originOfShellCollectionId = await api.query.pwNftSale.originOfShellCollectionId();
            if (originOfShellCollectionId.isSome) {
                const nextNftId = await khalaApi.query.rmrkCore.nextNftId(originOfShellCollectionId.unwrap());
                for (let nftId = 0; nftId < nextNftId; nftId++) {
                    const actualAttr = await khalaApi.query.uniques.attribute(originOfShellCollectionId.unwrap(), nftId, attrKey);
                    // attrType examples: PalletPhalaWorldRarityType, PalletPhalaWorldRaceType, PalletPhalaWorldCareerType
                    const actualAttrValue = khalaApi.createType(attrType, actualAttr.unwrap()[0]);
                    const expectedAttrValue = khalaApi.createType(attrType, attrValue);
                    let isCorrectAttr = actualAttrValue.eq(expectedAttrValue);
                    console.log(`Is filtered type ${attrType} key ${attrKey} value ${expectedAttrValue} equal to actual key value ${actualAttrValue}: ${isCorrectAttr}`);
                    if (isCorrectAttr) {
                        nftIdsArr.push(nftId);
                    }
                }

            }
            console.log(`NFTs with ${attrType}:${attrKey}:${attrValue} are ${nftIdsArr}`);
            return nftIdsArr
        }

        async function displayFilteredNftArray(khalaApi, collectionId, nftIdsArr) {
            for(const nftId in nftIdsArr) {
                const originOfShell = await khalaApi.query.rmrkCore.nfts(collectionId, nftId);
                if (originOfShell.isSome) {
                    console.log(originOfShell.unwrap().toHuman());
                }
            }
        }

        let nftIdsArr = await filterOriginShellsByAttribute(api, 'PalletPhalaWorldRarityType', 'rarity', 'Legendary');
        const originOfShellCollectionId = await api.query.pwNftSale.originOfShellCollectionId();
        if (originOfShellCollectionId.isSome) {
            await displayFilteredNftArray(api, originOfShellCollectionId.unwrap(), nftIdsArr);
        }
    }

}

main().catch(console.error).finally(() => process.exit());