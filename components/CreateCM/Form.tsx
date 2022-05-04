import React, { FC, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useForm } from "hooks/useForm";
import {
  getCandyMachineV2Config,
  CandyMachineConfig,
  Gatekeeper,
  StorageType,
  verifyAssets,
} from "lib/candy-machine/upload/config";
import { UTCify } from "./utils";

const Form: FC = () => {
  const { publicKey } = useWallet();
  const [files, setFiles] = useState<File[]>([]);

  function checkFormIsValid() {
    // TODO add more conditions
    if (files.length == 0) return false;
    if (!values["date-mint"] || !values["time-mint"]) return false;
    if (values.price == 0 || isNaN(values.price)) return false;
    if (values["number-of-nfts"] == 0 || isNaN(values["number-of-nfts"]))
      return false;

    return true;
  }

  function uploadAssets(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return false;
    const fileList = new Array<File>();
    Array.from(e.target.files).forEach((file) => {
      fileList.push(file);
    });
    setFiles(fileList);
  }

  function createCandyMachineV2() {
    if (!checkFormIsValid()) return;
    const config: CandyMachineConfig = {
      price: values.price,
      number: values["number-of-nfts"],
      gatekeeper: values.captcha ? Gatekeeper : null,
      solTreasuryAccount: values["treasury-account"],
      splTokenAccount: null,
      splToken: null,
      goLiveDate: UTCify(values["date-mint"], values["time-mint"]),
      endSettings: null,
      whitelistMintSettings: null,
      hiddenSettings: null,
      storage: values.storage.toLowerCase() as StorageType,
      ipfsInfuraProjectId: null,
      ipfsInfuraSecret: null,
      nftStorageKey: null,
      awsS3Bucket: null,
      noRetainAuthority: false,
      noMutable: values.mutable,
      arweaveJwk: null,
      batchSize: null,
      pinataGateway: null,
      pinataJwt: null,
      uuid: null,
    };
    console.log(files.length);
    if (publicKey) {
      verifyAssets(files, config.storage, config.number);

      getCandyMachineV2Config(publicKey, config);
    }
  }

  const initialState = {
    price: 0,
    "number-of-nfts": 0,
    "treasury-account": "",
    captcha: false,
    mutable: false,
    "date-mint": "",
    "time-mint": "",
    storage: "",
    files: [],
  } as const;

  const { onChange, onSubmit, values } = useForm(
    createCandyMachineV2,
    initialState
  );

  return (
    <form
      className="flex flex-col items-center h-auto justify-center mt-8"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col p-4 xxl-shadow rounded-2xl scale-90 bg-gray-200 min-w-max items-center justify-center">
        <FormInput
          id="price"
          text="Price of each NFT"
          type="number"
          onChange={onChange}
        />
        <FormInput
          id="number-of-nfts"
          text="Number of NFTs"
          type="number"
          onChange={onChange}
        />
        <FormInput
          id="treasury-account"
          text="Treasury Account"
          type="text"
          onChange={onChange}
          defaultValue={publicKey?.toBase58()}
        />
        <FormInput
          id="captcha"
          text="Captcha?"
          type="checkbox"
          onChange={onChange}
        />
        <FormInput
          id="mutable"
          text="Mutable?"
          type="checkbox"
          onChange={onChange}
        />
        <FormInput
          id="date-mint"
          text="Date for mint"
          type="date"
          onChange={onChange}
        />
        <FormInput
          id="time-mint"
          text="Time for mint"
          type="time"
          onChange={onChange}
        />
        <label htmlFor="storage">Storage</label>
        <input list="storage" name="storage" className="w-[40rem]" />
        <datalist id="storage" defaultValue="Arweave">
          <option value="Arweave" />
        </datalist>

        <label htmlFor="files">Files</label>

        <input type="file" name="files" multiple onChange={uploadAssets} />
        <button
          type="submit"
          className="bg-slate-500 w-fit p-4 rounded-2xl mt-6 text-white"
        >
          Create Candy Machine
        </button>
      </div>
    </form>
  );
};

interface Props {
  id: string;
  text: string;
  type: string;
  defaultValue?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormInput: FC<Props> = ({
  id,
  text,
  type,
  defaultValue,
  value,
  onChange,
}) => {
  return (
    <>
      <label htmlFor={id}>{text}</label>
      <input
        className="w-[40rem]"
        id={id}
        type={type}
        name={id}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
      />
    </>
  );
};

export default Form;

/** 
"price": 0.01,
"number": 4,
"gatekeeper": {
  "gatekeeperNetwork": "ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6",
  "expireOnUse": true
},
"solTreasuryAccount": "BoX451MZzydoVdZE4NFfmMT3J5Ztqo7YgUNbwwMfjPFu",
"splTokenAccount": null,
"splToken": null,
"goLiveDate": "3 May 2021 08:00:00 GMT",
"endSettings": null,
"whitelistMintSettings": null,
"hiddenSettings": null,
"storage": "arweave",
"ipfsInfuraProjectId": null,
"ipfsInfuraSecret": null,
"nftStorageKey": null,
"awsS3Bucket": null,
"noRetainAuthority": false,
"noMutable": false
**/
