import { useEffect, useState } from "react";

const USER_ID = "69bc130abdcd059844b6ed1d";

export function useFourMonths() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const promises = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      promises.push(
        fetch(`/api/symptoms?userId=${USER_ID}&year=${d.getFullYear()}&month=${d.getMonth()}`)
          .then((r) => r.json())
          .then((res) => ({ year: d.getFullYear(), month: d.getMonth(), days: res.days ?? [] }))
      );
    }
    Promise.all(promises).then((results) => { setData(results); setLoading(false); });
  }, []);

  return { data, loading };
}