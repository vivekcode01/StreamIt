// import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect, useRef } from "react";
import { useLocation, useNavigation } from "react-router-dom";

export function SuspendedPage() {
  const navigation = useNavigation();
  const location = useLocation();
  const ref = useRef(false);

  console.log(navigation);

  useEffect(() => {
    if (!ref.current) {
      ref.current = true;
      console.log("start");
    }
  }, [navigation]);

  useEffect(() => {
    if (ref.current) {
      ref.current = false;
      console.log("finished");
    }
  }, [location]);

  return null;
}
