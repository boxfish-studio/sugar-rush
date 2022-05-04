import React, { FC, useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const Gatekeeper = {
  gatekeeperNetwork: "ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6",
  expireOnUse: true
} as const;
type Storage = "arweave" | "ipfs" | "pinata";

interface CandyMachineConfig {
  price: number;
  number: number;
  gatekeeper: typeof Gatekeeper | null;
  solTreasuryAccount: string;
  splTokenAccount: null;
  splToken: null;
  goLiveDate: string;
  endSettings: null;
  whitelistMintSettings: null;
  hiddenSettings: null;
  storage: Storage;
  ipfsInfuraProjectId: null;
  ipfsInfuraSecret: null;
  nftStorageKey: null;
  awsS3Bucket: null;
  noRetainAuthority: boolean;
  noMutable: boolean;
}

function UTCify(dateTime: string, time: string): string {
  let UTCDate: string[] | string = new Date(dateTime)
    .toDateString()
    .slice(4)
    .split(" ");
  const tempA = UTCDate[0];
  UTCDate[0] = UTCDate[1];
  UTCDate[1] = tempA;
  UTCDate = UTCDate.join(".").replaceAll(".", " ");

  const UTCTime = `${time}:00 GMT`;

  return `${UTCDate} ${UTCTime}`;
}

const Form: FC = () => {
  const { publicKey } = useWallet();
  const [dateTime, setDateTime] = useState("");
  const [time, setTime] = useState("");

  // TODO change any for correct type
  function createCandyMachineV2(e: any) {
    e.preventDefault();

    const fields = [
      "price",
      "number-of-nfts",
      "treasury-account",
      "captcha",
      "mutable",
      "date-mint",
      "time-mint",
    ] as const;

  // TODO change any for correct type

    const form: {
      [key: string]: any;
    } = {};

    for (let field of fields) {
      if (e.target[field].type == "checkbox") {
        form[field] = e.target[field]?.checked;
      } else {
        form[field] = e.target[field]?.value;
      }
    }
    const config: CandyMachineConfig = {
      price: form.price,
      number: form["number-of-nfts"],
      gatekeeper: form.captcha ? Gatekeeper : null,
      solTreasuryAccount: form.treasuryAccount,
      splTokenAccount: null,
      splToken: null,
      goLiveDate: UTCify(form["date-mint"], form["time-mint"]),
      endSettings: null,
      whitelistMintSettings: null,
      hiddenSettings: null,
      storage: form.storage,
      ipfsInfuraProjectId: null,
      ipfsInfuraSecret: null,
      nftStorageKey: null,
      awsS3Bucket: null,
      noRetainAuthority: false,
      noMutable: form.mutable,
    };
  }

  useEffect(() => {
    console.log(UTCify(dateTime, time));
  }, [dateTime, time]);

  return (
    <form
      className="flex flex-col items-center h-auto justify-center mt-8"
      onSubmit={createCandyMachineV2}
    >
      <div className="flex flex-col p-4 xxl-shadow rounded-2xl scale-90 bg-gray-200 min-w-max items-center justify-center">
        <FormInput id="price" text="Price of each NFT" type="number" />
        <FormInput id="number-of-nfts" text="Number of NFTs" type="number" />
        <FormInput
          id="treasury-account"
          text="Treasury Account"
          type="text"
          defaultValue={publicKey?.toBase58()}
        />
        <FormInput id="captcha" text="Captcha?" type="checkbox" />
        <FormInput id="mutable" text="Mutable?" type="checkbox" />
        <FormInput
          id="date-mint"
          text="Date for mint"
          type="date"
          value={dateTime}
          setValue={setDateTime}
        />
        <FormInput
          id="time-mint"
          text="Time for mint"
          type="time"
          value={time}
          setValue={setTime}
        />

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
  setValue?: (value: string) => void;
}

const FormInput: FC<Props> = ({
  id,
  text,
  type,
  defaultValue,
  value,
  setValue,
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
        onChange={(e) => {
          if (setValue) setValue(e.target.value);
        }}
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
