export function Lighting({
  shadows = true,
  extent = 4,
}: {
  shadows?: boolean;
  extent?: number;
}) {
  return (
    <>
      <ambientLight intensity={0.24} color="#e6e8e3" />
      <directionalLight
        position={[-3.5, 5, 4]}
        intensity={2.5}
        color="#fff6ee"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-intensity={0.55}
        shadow-radius={5}
        shadow-bias={-0.00006}
        shadow-normalBias={0.012}
        shadow-camera-near={0.5}
        shadow-camera-far={18}
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
      />
      <directionalLight
        position={[3, 1.5, 1]}
        intensity={0.9}
        color="#e1e9f0"
      />
      <spotLight
        position={[1, 4, -3]}
        intensity={18}
        angle={0.65}
        penumbra={1}
        color="#f4e4d5"
      />
    </>
  );
}
