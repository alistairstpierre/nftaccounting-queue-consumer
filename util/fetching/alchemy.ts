import { Trade } from "../../interfaces";
import axios from "axios";

interface LooseObject {
  [key: string]: any;
}

export const get_image_urls = async (trades: Trade[]) => {
  // organize data into a format that alchemy can accept
  const startTime = performance.now();
  const nfts: LooseObject = {};
  trades.forEach((element) => {
    if (element.contract && element.contract.toLowerCase() == "erc721") {
      if (element.projectAddress && element.tokenId)
        nfts[`${element.projectAddress}${element.tokenId}`] = { contractAddress: element.projectAddress, tokenId: element.tokenId };
    } else {
      if (element.projectAddress && !nfts.hasOwnProperty(element.projectAddress)) {
        nfts[element.projectAddress] = { contractAddress: element.projectAddress, tokenId: element.tokenId };
      }
    }
  });
  let data = await fetch_alchemy_meta_data(nfts);
  data = data.flat();
  // find the image url for each nft and add it to the trade
  // check to see if it has an editable url or not, if not just use the collection url for now.
  trades.forEach((element) => {
    if (element.projectAddress && element.tokenId) {
      const nft = data.find((x: any) => x.id.tokenId == element.tokenId && x.contract.address == element.projectAddress);
      if (nft) {
        if (nft.media[0].gateway.includes("alchemyapi")) {
          element.imgUrl = editAlchemyUrl(nft.media[0].gateway, 40);
        }
        // else if (
        //   nft.media[0].gateway.includes("lh3.googleusercontent.com") ||
        //   nft.media[0].gateway.includes("openseauserdata.com") ||
        //   nft.media[0].gateway.includes("i.seadn.io") ||
        //   nft.media[0].gateway.includes("ipfs.io")
        // ) {
        //   element.img_url = nft.media[0].gateway;
        // } 
        else {
          element.imgUrl = editOpenseaUrl(nft.contractMetadata.openSea.imageUrl, 250);
        }
        if (!element.projectName) element.projectName = nft.contractMetadata.name;
      }
    }
  });
  const endTime = performance.now();
  console.log(`Fetch images took ${endTime - startTime} milliseconds`);
  return trades;
};

const editOpenseaUrl = (url: string, size: number) => {
  const split = url.split("?w=500&auto=format");
  split[1] = `?w=${size}&auto=format`;
  return split.join("");
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
    const response = axios.post(baseURL, { tokens: batch }, options).then((res) => res.data).catch((err) => { controller.abort(); console.log(err); global.request_aborted = true;});
    if(global.request_aborted) break;
    data.push(response);
  }
  return Promise.all(data);
};

const sleep = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const alchemy_call_amount_check = async () => {
  if (globalThis.alchemy_call_amount >= 5) {
    console.log("alchemy calls at 5 sleeping for 1.5 seconds");
    await sleep(1.5);
    console.log("sleep finished");
    globalThis.alchemy_call_amount = 0;
  } else {
    globalThis.alchemy_call_amount += 1;
  }
};
