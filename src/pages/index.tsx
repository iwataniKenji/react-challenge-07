import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

interface Image {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

interface GetImagesResponse {
  after: string;
  data: Image[];
}

export default function Home(): JSX.Element {
  // função de chamada de API
  async function fetchImages({ pageParam = null }): Promise<GetImagesResponse> {
    const { data } = await api('/api/images', {
      params: {
        after: pageParam,
      },
    });

    return data;
  }

  // função para puxar imagens da API
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery('images', fetchImages, {
    getNextPageParam: lastPage => lastPage?.after || null,
  });

  const formattedData = useMemo(() => {
    // formatar para flat array
    const formatted = data?.pages.flatMap(imageData => {
      return imageData.data.flat();
    });
    return formatted;
  }, [data]);

  // renderizar tela de carregamento
  if (isLoading && !isError) {
    return <Loading />;
  }

  // renderizar tela de erro
  if (!isLoading && isError) {
    return <Error />;
  }

  return (
    <>
      <Header />

      <Box maxW={1120} px={[10, 15, 20]} mx="auto" my={[10, 15, 20]}>
        <CardList cards={formattedData} />
        {hasNextPage && (
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
          </Button>
        )}
      </Box>
    </>
  );
}
