import { useEffect, useState } from "react";

const USER_ID = "69bc130abdcd059844b6ed1d";

export function useFullYear() {
  const [allDays, setAllDays] = useState([]);
  const [logLoading, setLogLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const promises = [];
    for (let m = 0; m < 12; m++) {
      promises.push(
        fetch(`/api/symptoms?userId=${USER_ID}&year=${year}&month=${m}`)
          .then((r) => r.json())
          .then((data) => data.days ?? [])
      );
    }
    Promise.all(promises).then((results) => {
      const all = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
      setAllDays(all);
      setLogLoading(false);
    });
  }, []);

  return { allDays, logLoading };
}