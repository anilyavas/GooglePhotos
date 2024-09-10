import { AntDesign } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { useMedia } from '~/providers/MediaProvider';
import { getImagekitUrlFromPath } from '~/utils/imagekit';

export default function AssetPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAssetById, syncToCloud } = useMedia();

  const asset = getAssetById(id);

  if (!asset) {
    return <Text>Asset not found!</Text>;
  }
  const uri = getImagekitUrlFromPath('', [
    { width: 200, height: 200 },
    { raw: 'l-text,i-anil,fs-30,l-end,co-ffffff' },
  ]);
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Photo',
          headerRight: () => (
            <AntDesign
              onPress={() => syncToCloud(asset)}
              name="cloudupload"
              size={24}
              color="black"
            />
          ),
        }}
      />
      <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
    </>
  );
}
