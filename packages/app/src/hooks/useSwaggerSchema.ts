import useSWR from "swr";

export function useSwaggerSchema(url: string, endpoint: string) {
  const { data } = useSWR(url, async (url) => {
    const response = await fetch(url);
    return response.json();
  });

  return data?.paths[endpoint].post.requestBody.content["application/json"]
    .schema;
}
