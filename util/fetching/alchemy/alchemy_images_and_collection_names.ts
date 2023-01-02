import { Trade } from "../../../interfaces";
import axios from "axios";

interface LooseObject {
  [key: string]: any;
}

export const get_alchemy_imageurls_and_collectionnames = async (trades: Trade[]) => {
  // organize data into a format that alchemy can accept
  const startTime = performance.now();
  const nfts: LooseObject = {};
  trades.forEach((element) => {
    if (element.projectAddress && element.tokenId)
      nfts[`${element.projectAddress}${element.tokenId}`] = { contractAddress: element.projectAddress, tokenId: element.tokenId };
  });
  let data: any = await fetch_alchemy_meta_data(nfts)
    .then((res) => {
      return res.flat();
    })
    .catch((err) => {
      console.log(err);
      global.request_aborted = true;
    });

  if(global.request_aborted) return;

  // find the image url for each nft and add it to the trade
  // check to see if it has an editable url or not, if not just use the collection url for now.
  //console.log(data.filter((x: any) => x.contract.address == "0xc850d7e5aa630f18ff5d786b3c75b3ef3646e012"));
  trades.forEach((element) => {
    if (element.projectAddress && element.tokenId) {
      const nft = data.find((x: any) => x.contract.address == element.projectAddress && x.id.tokenId == element.tokenId);
      if (nft) {
        try{
          if(nft.contractMetadata != undefined){
            element.projectName = element.projectName == undefined || element.projectName == "" ? nft.contractMetadata.name : element.projectName;
          }
          if((nft.contract.address as string).toLowerCase() == "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85".toLowerCase()){
            element.imgUrl = "/ens.png";
            element.projectName = "Ethereum Name Service"
          }
          else if (nft.media[0].gateway.includes("alchemyapi")) {
            element.imgUrl = editAlchemyUrl(nft.media[0].gateway, 40);
          } else if(nft.contractMetadata.openSea != undefined && nft.contractMetadata.openSea?.imageUrl != undefined){
            element.imgUrl = editOpenseaUrl(nft.contractMetadata.openSea.imageUrl, 250);
          }
          else {
            element.imgUrl = nft.metadata.image;
          }
        }catch(err){
          console.log(nft)
          console.log(err)
        }
      }
    }
    // if(element.tokenId == undefined){
    //   console.log(element)
    // }
  });
  const endTime = performance.now();
  console.log(`Fetch images took ${endTime - startTime} milliseconds`);
  return trades;
};

const editOpenseaUrl = (url: string, size: number) => {
  try {
    const split = url.split("?w=500&auto=format");
    split[1] = `?w=${size}&auto=format`;
    return split.join("");
  } catch (error) {
    console.log(error);
    console.log(url);
  }
};

const editAlchemyUrl = (url: string, size: number) => {
  const split = url.split("https://res.cloudinary.com/alchemyapi/image/upload/");
  split[1] = `w_${size},h_${size}/` + split[1];
  return split.join("https://res.cloudinary.com/alchemyapi/image/upload/");
};

const fetch_alchemy_meta_data = async (nfts: LooseObject) => {
  const apiKey = `${process.env.ALCHEMY_API_KEY}`;
  const baseURL = `https://eth-mainnet.g.alchemy.com/nft/v2/${apiKey}/getNFTMetadataBatch`;
  const data: any = [];

  const options = {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  };

  const controller = new AbortController();
  for (let i = 0; i < Object.values(nfts).length; i += 100) {
    await alchemy_call_amount_check();
    const batch = Object.values(nfts).slice(i, i + 100);
    const response = axios.post(baseURL, { tokens: batch }, options).then((res) => res.data).catch((err) => { controller.abort(); console.log(err); global.request_aborted = true; });
    if (global.request_aborted) break;
    data.push(response);
  }
  return Promise.all(data);
};

const sleep = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const alchemy_call_amount_check = async () => {
  if (globalThis.alchemy_call_amount >= 5) {
    console.log("alchemy calls at 5 sleeping for 1.1 seconds");
    await sleep(1.1);
    console.log("sleep finished");
    globalThis.alchemy_call_amount = 0;
  } else {
    globalThis.alchemy_call_amount += 1;
  }
};
