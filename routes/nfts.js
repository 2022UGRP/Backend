var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var axios = require('axios')
var FormData = require('form-data')
const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3('https://eth-goerli.g.alchemy.com/v2/R_XEHCUaW5cgauJTFgvfWZ4vkJulC5O2');
require('dotenv').config();

const contractAbi = require('../contracts/contracts_TestNFT_sol_TestNFT_abi.json');
const Portfolio = require('../schema/portfolio');
const User = require('../schema/user');

const random = (i) => Math.floor(Math.random() * (i - 1)) + 1;

const root = __dirname.replace('routes', '');
const contractAddress = '0x1992671162D07A68722E12eeB7B293c8892Eb66C'; // deploy contract address

router.put('/default/:portfolioKey', async (req, res, next) => {
  const { portfolioKey } = req.params;
  let image;
  const parts = [
    path.join(root, 'layers', 'Background', `${random(5)}#10.png`),
    path.join(root, 'layers', 'default', 'Cloud', `${random(11)}.png`),
    path.join(root, 'layers', 'default', 'Ground', `${random(5)}.png`),
    path.join(root, 'layers', 'default', 'Grass', `${random(25)}.png`),
    path.join(root, 'layers', 'default.png')
  ];
  console.log(parts)
  await mergeImages(parts, {
    Canvas: Canvas,
    Image: Image
  }).then(async base64 => {
    const base64Data = base64.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    fs.writeFileSync(path.join(root, 'temp.png'), base64Data, { encoding: 'base64' });
    image = await uploadImage('base');

    Portfolio.findOneAndUpdate(
      { _id: portfolioKey },
      { $set: { Image: image } },
      function (err, Uresult) {
        if (err) throw err;
      }
    );
    console.log(image);
    res.send({ image: image });
  });
});

router.put('/mint/:portfolioKey', async (req, res, next) => {
  const { address, title, price } = req.body;
  const { portfolioKey } = req.params;

  const value = web3.utils.toWei(price, 'ether');
  console.log('wei:', value);

  const portfolio = await Portfolio.findOne({ _id: portfolioKey }).exec();
  const result = await create(portfolio.Elements, portfolio.Selfintros);
  console.log(result);

  const image = result.path;

  console.log('upload ipfs');
  const metadata = await uploadIpfs(title, image, result.description);
  console.log(metadata);

  const abi = contractAbi;
  const contract = new web3.eth.Contract(abi, contractAddress);

  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: address, // must match user's active address.
    data: contract.methods
      .mintNFT(metadata)
      .encodeABI(),
    value: value
  };

  res.send({ param: transactionParameters, result: result });
});

const create = async (elements, selfintros) => {
  let description = '';

  let parts = [path.join(root, 'layers', 'Background', `${random(5)}#10.png`)];
  let schoolFlag = 0, careerFlag = false, congressFlag = 0;
  let hat = 1, cloud, accessory, pattern, fur, eyedetail, horn, glass, ear, necklace;
  elements.forEach(element => {
    description += element.Activity + ': ' + element.Contents + '\n';
    switch (element.Activity) {
      case '언어능력':
        horn = path.join(root, 'layers', 'Horn', `${random(8)}#10.png`);
        break;
      case '자격증(민간, 국가공인)':
        eyedetail = path.join(root, 'layers', 'Eyedetail', `${random(8)}#10.png`);
        break;
      case '성적 및 학점':
        if (element.Contents === '') {
          fur = path.join(root, 'layers', 'Fur', '8#10.png');
        } else {
          const grade = Number(element.Contents);
          if (grade >= 96.9) {
            fur = path.join(root, 'layers', 'Fur', `1#10.png`);
          } else if (grade >= 93.8) {
            fur = path.join(root, 'layers', 'Fur', `2#10.png`);
          } else if (grade >= 91.8) {
            fur = path.join(root, 'layers', 'Fur', `3#10.png`);
          } else if (grade >= 90) {
            fur = path.join(root, 'layers', 'Fur', `4#10.png`);
          } else if (grade >= 86.6) {
            fur = path.join(root, 'layers', 'Fur', `5#10.png`);
          } else if (grade >= 76.3) {
            fur = path.join(root, 'layers', 'Fur', `6#10.png`);
          } else {
            fur = path.join(root, 'layers', 'Fur', `7#10.png`);
          }
        }
        break;
      case '전공 및 학교':
        if (element.Contents.split('학교').length > 2) {
          cloud = path.join(root, 'layers', 'Cloud', `${random(4)}#10.png`);
          accessory = path.join(root, 'layers', 'Accessory', `${random(6)}#10.png`);
        } else if (schoolFlag === 2) {
          cloud = path.join(root, 'layers', 'Cloud', `${random(4)}#10.png`);
          schoolFlag = 3;
        } else if (schoolFlag === 1) {
          accessory = path.join(root, 'layers', 'Accessory', `${random(6)}#10.png`);
          schoolFlag = 3;
        } else if (random(10) > 6) {
          cloud = path.join(root, 'layers', 'Cloud', `${random(4)}#10.png`);
          schoolFlag = 1;
        } else if (random(10) <= 6) {
          accessory = path.join(root, 'layers', 'Accessory', `${random(6)}#10.png`);
          schoolFlag = 2;
        }
        break;
      case '경력':
        if (careerFlag)
          break;
        careerFlag = true;
        pattern = path.join(root, 'layers', 'Pattern', `${random(8)}#10.png`);
        glass = path.join(root, 'layers', 'Glass', `${random(8)}#10.png`);
        break;
      case '대외활동(대회, 공모전)':
        if (congressFlag > 0) {
          congressFlag++;
          break;
        }
        hat += random(8) - 1;
        ear = path.join(root, 'layers', 'Ear', `${random(9)}.png`);
        necklace = path.join(root, 'layers', 'Necklace', `${random(8)}#10.png`);
        congressFlag = true;
        break;
      case '개인 프로젝트':
        break;
      default:
        break;
    }
  });
  congressFlag = congressFlag > 2 ? 2 : congressFlag;
  hat = path.join(root, 'layers', 'Hat', `${hat}_${congressFlag + 1}#10.png`);

  if (typeof fur === 'string')
    parts.push(fur);
  if (typeof horn === 'string')
    parts.push(horn);
  if (typeof ear === 'string')
    parts.push(ear);
  if (typeof pattern === 'string')
    parts.push(pattern);
  if (typeof necklace === 'string')
    parts.push(necklace)
  if (typeof eyedetail === 'string')
    parts.push(eyedetail);
  if (typeof glass === 'string')
    parts.push(glass);
  if (typeof accessory === 'string')
    parts.push(accessory);
  if (typeof hat === 'string')
    parts.push(hat);
  if (typeof cloud === 'string')
    parts.push(cloud);

  selfintros.forEach(selfintro => {
    const date = new Date(selfintro.Date);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    description += '\n' + selfintro.Title + `(${y}.${m}.${d}):\n` + selfintro.Contents;
  });

  let image = 'temp.png';
  await mergeImages(parts, {
    Canvas: Canvas,
    Image: Image
  }).then(async base64 => {
    const base64Data = base64.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    fs.writeFileSync(image, base64Data, { encoding: 'base64' });
    console.log('upload image');
    image = await uploadImage('temp');
  });

  return { description: description, path: image };
};

const uploadImage = async (title) => {
  const jwt = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1ODJjOGVlNi1kYWM3LTQ2YWUtOTc2My1jYzUzYmMyNzJjMGYiLCJlbWFpbCI6ImtpbWRhaG9rQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJhZGM2MDhjMzg5NmVhNWM5ZDIwZCIsInNjb3BlZEtleVNlY3JldCI6IjdhM2E4YjM0ZTExZjc2NzNkNWY0ODQ4ZmUxNDVkZWQ1NTJkZTY3N2FkNDk1MjY2YTg5ZmY5NDllMjU4MjhlY2MiLCJpYXQiOjE2NzI4NDk0ODR9.rM5WqQPX29mNvUH2znXaQhKUwbVLo-rGLDrrTHtH7co';

  const formData = new FormData();

  const file = fs.createReadStream(path.join(root, 'temp.png'));
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: title,
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 0,
  })
  formData.append('pinataOptions', options);

  const imgRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    maxBodyLength: "Infinity",
    headers: {
      'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
      Authorization: jwt
    }
  });

  return 'https://gateway.pinata.cloud/ipfs/' + imgRes.data.IpfsHash;
};

const uploadIpfs = async (name, image, des) => {
  const key = 'adc608c3896ea5c9d20d';
  const secret = '7a3a8b34e11f7673d5f4848fe145ded552de677ad495266a89ff949e25828ecc';
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

  const body = {
    name: name,
    image: image,
    description: des
  };

  return axios
    .post(url, body, {
      headers: {
        pinata_api_key: key,
        pinata_secret_api_key: secret,
      }
    })
    .then(res => "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash)
    .catch(e => {
      console.log(e);
    });
};

router.put('/mint/success/:portfolioKey', async (req, res, next) => {
  const { address, title, name, result, txHash, price } = req.body;
  const { portfolioKey } = req.params;

  console.log('start to find and update');
  const nft = await Portfolio.findOneAndUpdate(
    { _id: portfolioKey },
    { $set: { State: 2, NFTtitle: title, NFTdesciription: result.description, Image: result.path, NFTownerAddress: address, NFTownerName: name, NFTtxHash: txHash, NFTprice: price } },
    function (err, Uresult) {
      if (err) throw err;
    }
  ).clone();

  const loginKey = nft.User_id;

  const portfolio = new Portfolio({
    User_id: loginKey,
    CopyrightHolderName: nft.CopyrightHolderName,
    State: 1,
    Elements: nft.Elements,
    Selfintros: nft.Selfintros,
    Image: nft.Image
  });

  Portfolio.create(portfolio, (e, p) => {
    User.findOneAndUpdate(
      { User_id: loginKey },
      {
        $push: {
          Portfolios: {
            Portfolio_id: p._id
          }
        },
      },
      function (err,) {
        if (err) throw err;
        res.send({ message: 'Success', portfolioKey: p._id });
      }
    )
  });
});

router.get('/info/:portfolioKey', async (req, res, next) => {
  const { portfolioKey } = req.params;
  Portfolio.findOne({ _id: portfolioKey })
    .exec()
    .then(async portfolio => {
      res.send({ description: portfolio.NFTdesciription, image: portfolio.Image });
    })
    .catch(e => console.log(e));
});

router.get('/market', async (req, res, next) => {
  const nfts = await Portfolio.find({ State: 2 });
  let result = [];
  nfts.forEach(nft => {
    result.push({
      NFT_id: nft._id,
      CopyrightHolder_id: nft.User_id,
      CopyrightHolderName: nft.CopyrightHolderName,
      Image: nft.Image,
      NFTprice: nft.NFTprice,
      NFTtitle: nft.NFTtitle,
      NFTownerName: nft.NFTownerName
    });
  });

  res.send({ nfts: result });
});

router.get('/purchase/:CopyrightHolder_id', async (req, res, next) => {
  const { CopyrightHolder_id } = req.params;
  console.log(CopyrightHolder_id);
  const nfts = await Portfolio.find({ User_id: CopyrightHolder_id, State: 2 });
  let result = [];
  nfts.forEach(nft => {
    result.push({
      NFT_id: nft._id,
      CopyrightHolder_id: nft.User_id,
      CopyrightHolderName: nft.CopyrightHolderName,
      Image: nft.Image,
      NFTprice: nft.NFTprice,
      NFTtitle: nft.NFTtitle,
      NFTownerName: nft.NFTownerName,
      NFTownerAddress: nft.NFTownerAddress
    });
  });

  res.send({ nfts: result });
});

router.put('/purchase', async (req, res, next) => {
  const { loginKey, address, portfolioKey } = req.body;
  const portfolio = await Portfolio.findOne({ _id: portfolioKey }).exec();
  if (portfolio.User_id === loginKey)
    res.send({ message: 'Its already own!' });

  User.findOneAndUpdate(
    { _id: portfolio.User_id },
    { $push: { Requests: { State: 1, NFTtxHash: portfolio.NFTtxHash, RequestAddress: address, User_id: loginKey } } },
    function (err, Uresult) {
      if (err) throw err;
    }
  );

  User.findOneAndUpdate(
    { _id: loginKey },
    { $push: { Purchases: { State: 1, Portfolio_id: portfolio._id } } },
    function (err, Uresult) {
      if (err) throw err;
    }
  );

  res.send({ message: 'Request purchase' });
});

router.get('/list/:loginKey', async (req, res, next) => {
  const { loginKey } = req.params;
  const user = await User.findOne({ _id: loginKey }).exec();
  res.send({ requests: user.Requests, purchases: user.Purchases });
});

router.put('/transfer', async (req, res, next) => {
  const { owner, to, txHash } = req.body;

  var api = require('etherscan-api').init('QF5WX8U8J34FUVTHCFNYNAPGRU5B6W4HGW', 'goerli', '3000');
  const receipt = await api.proxy.eth_getTransactionReceipt(txHash);

  const abi = contractAbi;
  const contract = new web3.eth.Contract(abi, contractAddress);

  const transactionParameters = {
    to: contractAddress,
    from: owner,
    data: contract.methods
      .safeTransferFrom(owner, to, parseInt(receipt.result.logs[0].topics[3]))
      .encodeABI(),
    gas: '1000000',
  };

  res.send({ param: transactionParameters });
});

router.put('/transfer/success', async (req, res, next) => {
  const { loginKey, to, toId, txHash } = req.body;

  const user = await User.findOne({ _id: toId }).exec();

  const portfolio = await Portfolio.findOneAndUpdate(
    { NFTtxHash: txHash },
    { $set: { NFTownerAddress: to, NFTownerName: user.Name } },
    function (err, Uresult) {
      if (err) throw err;
    }
  ).clone();

  User.findOne({ _id: loginKey })
    .updateOne(
      { 'Requests.NFTtxHash': txHash },
      { $set: { 'Requests.$.State': 2 } },
      function (err, Uresult) {
        if (err) throw err;
      }
    );

  User.findOne({ _id: toId })
    .updateOne(
      { 'Purchases.Portfolio_id': portfolio._id },
      { $set: { 'Purchases.$.State': 2 } },
      function (err, Uresult) {
        if (err) throw err;
      }
    ).clone();

  res.send({ message: 'Success transfer' });
});

module.exports = router;

// const deploy = async () => {
//   const { ethers } = require("hardhat");
//   const MyNFT = await ethers.getContractFactory("TestNFT");

//   const myNft = await MyNFT.deploy();
//   await myNft.deployed();
//   console.log("Contract deployed to address:", myNft.address);
// };

// deploy()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

// const sample = async () => {
//   let parts = [path.join(root, 'layers', 'Background', `${random(5)}#10.png`)];
//   let schoolFlag = 0, careerFlag = false, congressFlag = 0;
//   let hat = 1, cloud, accessory, pattern, fur, eyedetail, horn, glass, ear, necklace;
//   horn = path.join(root, 'layers', 'Horn', `${random(8)}#10.png`);
//   eyedetail = path.join(root, 'layers', 'Eyedetail', `${random(8)}#10.png`);
//   fur = path.join(root, 'layers', 'Fur', `${random(8)}#10.png`);
//   cloud = path.join(root, 'layers', 'Cloud', `${random(4)}#10.png`);
//   accessory = path.join(root, 'layers', 'Accessory', `${random(6)}#10.png`);
//   pattern = path.join(root, 'layers', 'Pattern', `${random(8)}#10.png`);
//   glass = path.join(root, 'layers', 'Glass', `${random(8)}#10.png`);
//   hat += random(8) - 1;
//   ear = path.join(root, 'layers', 'Ear', `${random(9)}.png`);
//   necklace = path.join(root, 'layers', 'Necklace', `${random(8)}#10.png`);
//   congressFlag = random(3) - 1;
//   congressFlag = congressFlag > 2 ? 2 : congressFlag;
//   hat = path.join(root, 'layers', 'Hat', `${hat}_${congressFlag + 1}#10.png`);

//   if (typeof fur === 'string')
//     parts.push(fur);
//   if (typeof horn === 'string')
//     parts.push(horn);
//   if (typeof ear === 'string')
//     parts.push(ear);
//   if (typeof pattern === 'string')
//     parts.push(pattern);
//   if (typeof necklace === 'string')
//     parts.push(necklace);
//   if (typeof eyedetail === 'string')
//     parts.push(eyedetail);
//   if (typeof glass === 'string')
//     parts.push(glass);
//   if (typeof accessory === 'string')
//     parts.push(accessory);
//   if (typeof hat === 'string')
//     parts.push(hat);
//   if (typeof cloud === 'string')
//     parts.push(cloud);

//   let image = 'temp.png';
//   console.log('Image merging...');
//   await mergeImages(parts, {
//     Canvas: Canvas,
//     Image: Image
//   }).then(async base64 => {
//     const base64Data = base64.replace(/^data:([A-Za-z-+/]+);base64,/, '');
//     fs.writeFileSync(image, base64Data, { encoding: 'base64' });
//   });
// };

// sample()
//   .then(res => {
//     console.log('finish');
//   })
//   .catch(e => console.log(e));
