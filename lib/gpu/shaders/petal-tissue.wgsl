// Three independent tissue scales packed into a linear RGB field. These are
// material inputs, never a flower image. Geometry and lighting remain 3D.
fn hashCell(p: vec2u) -> f32 {
  var h = p.x * 374761393u + p.y * 668265263u + 93u;
  h = (h ^ (h >> 13u)) * 1274126177u;
  h = h ^ (h >> 16u);
  return f32(h & 0x00ffffffu) / 16777215.0;
}

fn tissueNoise(p: vec2f) -> f32 {
  let cell = vec2u(floor(p));
  let f = fract(p);
  let w = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hashCell(cell), hashCell(cell + vec2u(1u, 0u)), w.x),
    mix(hashCell(cell + vec2u(0u, 1u)), hashCell(cell + vec2u(1u, 1u)), w.x),
    w.y
  );
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  return vec4f(
    tissueNoise(uv * 8.0),
    tissueNoise(uv * vec2f(11.0, 18.0)),
    tissueNoise(uv * 340.0),
    1.0
  );
}
