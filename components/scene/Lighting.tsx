export function Lighting({ shadows = true }: { shadows?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.19} color="#c7cfbe" />
      <directionalLight
        position={[-3.5, 5, 4]}
        intensity={3.2}
        color="#ffead5"
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.012}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight
        position={[3, 1.5, 1]}
        intensity={0.75}
        color="#ccdbe3"
      />
      <spotLight
        position={[1, 4, -3]}
        intensity={18}
        angle={0.65}
        penumbra={1}
        color="#f1d8ba"
      />
    </>
  );
}
