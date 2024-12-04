import { describe, expect, test } from "bun:test";
import { mockSessionWithInterstitials } from "./mock";
import { getStaticDateRanges } from "../src/interstitials";

describe("getStaticDateRanges", () => {
  test("should create dateRanges for vod", () => {
    const session = mockSessionWithInterstitials();

    const isLive = false;
    const dateRanges = getStaticDateRanges(session, isLive);

    expect(dateRanges).toMatchSnapshot();
  });

  test("should create dateRanges for live", () => {
    const session = mockSessionWithInterstitials();

    const isLive = true;
    const dateRanges = getStaticDateRanges(session, isLive);

    expect(dateRanges).toMatchSnapshot();
  });
});
