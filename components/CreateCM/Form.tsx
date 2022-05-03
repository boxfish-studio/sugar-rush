import { FC,  useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const Form: FC = () => {
  const { publicKey } = useWallet();

  const [dateTime, setDateTime] = useState("");
  const [time, setTime] = useState("");

  function UTCify(dateTime: string, time: string): string {
    // TODO
    return "";
  }

  useEffect(() => {
    console.log(UTCify(dateTime, time));
  }, [dateTime, time]);

  return (
    <form className="flex flex-col items-center h-auto justify-center mt-8">
      <div className="flex flex-col p-4 xxl-shadow rounded-2xl scale-90 bg-gray-200 min-w-full">
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

        <input type="submit" value="Create CandyMachine" />
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
