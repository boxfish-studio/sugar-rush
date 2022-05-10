import { FC } from 'react';

const Title: FC<{ text: string }> = ({ text }) => {
  return <h1 className='text-3xl mt-10 font-extrabold'>{text}</h1>;
};

export default Title;
