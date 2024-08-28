import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';

export default function Home() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [localAssets, setLocalAssets] = useState<MediaLibrary.Asset[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (permissionResponse?.status !== 'granted') {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    if (permissionResponse?.status === 'granted') {
      loadLocalAssets();
    }
  }, [permissionResponse]);

  const loadLocalAssets = async () => {
    if (loading || !hasNextPage) {
      return;
    }
    setLoading(true);
    const assetsPage = await MediaLibrary.getAssetsAsync({ after: endCursor });
    setLocalAssets((existingItems) => [...existingItems, ...assetsPage.assets]);
    setHasNextPage(assetsPage.hasNextPage);
    setEndCursor(assetsPage.endCursor);
    setLoading(false);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Photos' }} />
      <FlatList
        data={localAssets}
        columnWrapperClassName="gap-[2px]"
        contentContainerClassName="gap-[2px]"
        onEndReached={loadLocalAssets}
        refreshing={loading}
        onEndReachedThreshold={1}
        numColumns={4}
        renderItem={({ item }) => (
          <Image source={{ uri: item.uri }} style={{ width: '25%', aspectRatio: 1 }} />
        )}
      />
    </>
  );
}
