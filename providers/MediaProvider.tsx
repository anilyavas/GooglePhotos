import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import mime from 'mime';
import { createContext, PropsWithChildren, useContext, useState, useEffect } from 'react';

import { useAuth } from './AuthProvider';

import { supabase } from '~/utils/supabase';

type MediaContextType = {
  assets: MediaLibrary.Asset[];
  loadLocalAssets: () => void;
  getAssetById: (id: string) => MediaLibrary.Asset | undefined;
  syncToCloud: (asset: MediaLibrary.Asset) => void;
};
const MediaContext = createContext<MediaContextType>({
  assets: [],
  loadLocalAssets: () => {},
  getAssetById: () => undefined,
  syncToCloud: () => {},
});

export default function MediaContextProvider({ children }: PropsWithChildren) {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [localAssets, setLocalAssets] = useState<MediaLibrary.Asset[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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

  const getAssetById = (id: string) => {
    return localAssets.find((asset) => asset.id === id);
  };

  const syncToCloud = async (asset: MediaLibrary.Asset) => {
    //Uploading photo
    const info = await MediaLibrary.getAssetInfoAsync(asset);
    if (!info.localUri || !user) {
      return;
    }
    const base64String = await FileSystem.readAsStringAsync(info.localUri, { encoding: 'base64' });
    const arrayBuffer = decode(base64String);
    const { data: storedFile, error } = await supabase.storage
      .from('assets')
      .upload(`${user.id}/${asset.filename}`, arrayBuffer, {
        contentType: mime.getType(asset.filename) ?? 'image/jpeg',
        upsert: true,
      });
    if (storedFile) {
      const { data, error } = await supabase.from('assets').upsert({
        id: asset.id,
        path: storedFile?.path,
        user_id: user.id,
        mediaType: asset.mediaType,
        object_id: storedFile?.id,
      });
      console.log(data, error);
    }
  };

  return (
    <MediaContext.Provider
      value={{ assets: localAssets, loadLocalAssets, getAssetById, syncToCloud }}>
      {children}
    </MediaContext.Provider>
  );
}

export const useMedia = () => useContext(MediaContext);
