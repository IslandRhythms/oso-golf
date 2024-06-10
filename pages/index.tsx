'use strict'

import { GetServerSideProps } from 'next';
import { getHtmlTemplate } from './lib/getHtmlTemplate';

type Props = {
  htmlContent: string;
};

export default function HomePage({ htmlContent }: Props) {
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

export const getServerSideProps: GetServerSideProps = async () => {
  const htmlContent = getHtmlTemplate();
  return {
    props: {
      htmlContent,
    },
  };
};