import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { FlatList } from 'react-native';

import { useMedia } from '~/providers/MediaProvider';

export default function Home() {
  const { assets, loadLocalAssets } = useMedia();

  return (
    <>
      <Stack.Screen options={{ title: 'Photos' }} />
      <FlatList
        data={assets}
        columnWrapperClassName="gap-[2px]"
        contentContainerClassName="gap-[2px]"
        onEndReached={loadLocalAssets}
        //refreshing={loading}
        onEndReachedThreshold={1}
        numColumns={4}
        renderItem={({ item }) => (
          <Image source={{ uri: item.uri }} style={{ width: '25%', aspectRatio: 1 }} />
        )}
      />
    </>
  );
}
