export default function PatientView({ data }) {
  const latest = data.records?.[0];

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      {/* Demographics */}
      <section>
        <h2 className="font-bold text-lg mb-2">Pasientinfo</h2>
        <p>Alder: {data.age}</p>
        <p>Kjønn: {data.gender === "male" ? "Mann" : "Kvinne"}</p>
        <p>Aktiv abonnement: {data.hasActiveSubscription ? "Ja" : "Nei"}</p>
      </section>

      {/* Latest CAT score */}
      {latest && (
        <section>
          <h2 className="font-bold text-lg mb-2">
            Siste CAT-registrering ({latest.date})
          </h2>
          <p>Total CAT8-score: {latest.cat8}</p>
          <p>Hoste: {latest.cat8Cough}</p>
          <p>Slim: {latest.cat8Phlegm}</p>
          <p>Brysttetthet: {latest.cat8ChestTightness}</p>
          <p>Kortpustethet: {latest.cat8Breathlessness}</p>
          <p>Aktiviteter: {latest.cat8Activities}</p>
          <p>Trygghet: {latest.cat8Confidence}</p>
          <p>Søvn: {latest.cat8Sleep}</p>
          <p>Energi: {latest.cat8Energy}</p>
          <p>Fysisk aktivitet (min): {latest.physicalActivity}</p>
          <p>Vekt: {latest.weight} kg</p>
        </section>
      )}

      {/* Medicines */}
      {data.userMedicines?.length > 0 && (
        <section>
          <h2 className="font-bold text-lg mb-2">Medisiner</h2>
          <ul className="space-y-3">
            {data.userMedicines.map((um) => (
              <li key={um.medicineId} className="flex items-center gap-3">
                {um.medicine.image && (
                  <img
                    src={um.medicine.image}
                    alt={um.medicine.name}
                    className="w-10 h-10 object-contain rounded"
                  />
                )}
                <div>
                  <p className="font-semibold">{um.medicine.name}</p>
                  <p className="text-xs text-gray-500">
                    Startet: {um.startedUsage}
                    {um.stoppedUsage ? ` · Sluttet: ${um.stoppedUsage}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Latest GAD-7 */}
      {data.latestGad7 && (
        <section>
          <h2 className="font-bold text-lg mb-2">
            Siste GAD-7 ({data.latestGad7.date})
          </h2>
          {Object.entries(data.latestGad7)
            .filter(([k]) => k !== "date")
            .map(([k, v]) => (
              <p key={k}>
                {k}: {v}
              </p>
            ))}
        </section>
      )}
    </div>
  );
}
