import type { NextPage } from 'next';
import { useRouter } from 'next/router';

const CandyMachine: NextPage = () => {
  const router = useRouter();
  const account = router.query.id;

  return <div>{account}</div>;
};

export default CandyMachine;
