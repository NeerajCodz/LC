// Linear HDR radiance, sampled by the WebGL GGX-prefiltered environment.
fn softbox(direction: vec3f, center: vec3f, extent: vec2f) -> f32 {
  let n = normalize(center);
  let right = normalize(cross(vec3f(0.0, 1.0, 0.0), n));
  let up = cross(n, right);
  let facing = dot(direction, n);
  let plane = vec2f(dot(direction, right), dot(direction, up)) / max(facing, 0.001);
  let edge = max(abs(plane.x) / extent.x, abs(plane.y) / extent.y);
  return (1.0 - smoothstep(0.88, 1.12, edge)) * step(0.0, facing);
}
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let longitude = (uv.x - 0.5) * 6.283185307;
  let latitude = (uv.y - 0.5) * 3.141592654;
  let direction = vec3f(cos(latitude) * cos(longitude), sin(latitude), cos(latitude) * sin(longitude));
  let key = softbox(direction, vec3f(-3.0, 4.0, 2.0), vec2f(0.42, 0.66));
  let fill = softbox(direction, vec3f(4.0, 2.0, 1.0), vec2f(0.38, 0.6));
  let rim = softbox(direction, vec3f(0.0, 4.0, -4.0), vec2f(0.5, 0.2));
  let ceiling = pow(max(direction.y, 0.0), 3.0) * 0.025;
  let radiance = vec3f(0.012, 0.013, 0.014) + ceiling
    + key * vec3f(3.4, 3.15, 2.94) + fill * vec3f(0.62, 0.71, 0.86) + rim * vec3f(2.6, 2.4, 2.2);
  return vec4f(radiance, 1.0);
}
