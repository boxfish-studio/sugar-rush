import { useState } from "react";

const useForm = (cb: () => any, files:File[]) => {

  const initialState = {
    price: 0,
    'number-of-nfts': 0,
    'treasury-account': '',
    captcha: false,
    mutable: false,
    'date-mint': '',
    'time-mint': '',
    storage: '',
    files: [],
  } as const;
  
  const [values, setValues] = useState(initialState);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [event.target.name]: event.target.type === "checkbox" ? event.target.checked : event.target.value });
    console.log(values);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await cb();
  };

  

 

  return {
    onChange,
    onSubmit,
    values,
    
  };
};

export default useForm;
