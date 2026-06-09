import {
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

import { db } from "./firebase";

type FirestoreState<T> = readonly [
  T,
  Dispatch<SetStateAction<T>>,
  boolean,
  string | null
];

export function useFirestoreDocument<T>(
  userId: string,
  documentName: string,
  initialValue: T
): FirestoreState<T> {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const documentReference = doc(
      db,
      "owners",
      userId,
      "dashboard",
      documentName
    );

    const unsubscribe = onSnapshot(
      documentReference,
      async (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.data();

            if (Object.prototype.hasOwnProperty.call(data, "value")) {
              setValue(data.value as T);
            }
          } else {
            await setDoc(documentReference, {
              value: initialValue,
              updatedAt: new Date().toISOString(),
            });

            setValue(initialValue);
          }

          setLoading(false);
          setError(null);
        } catch (snapshotError) {
          console.error(
            `Unable to load Firestore document "${documentName}":`,
            snapshotError
          );

          setError(`Unable to load ${documentName}.`);
          setLoading(false);
        }
      },
      (snapshotError) => {
        console.error(
          `Firestore listener failed for "${documentName}":`,
          snapshotError
        );

        setError(`Unable to synchronize ${documentName}.`);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [documentName, initialValue, userId]);

  const updateValue: Dispatch<SetStateAction<T>> = useCallback(
    (nextValue) => {
      setValue((currentValue) => {
        const resolvedValue =
          typeof nextValue === "function"
            ? (nextValue as (previousValue: T) => T)(currentValue)
            : nextValue;

        const documentReference = doc(
          db,
          "owners",
          userId,
          "dashboard",
          documentName
        );

        void setDoc(documentReference, {
          value: resolvedValue,
          updatedAt: new Date().toISOString(),
        }).catch((writeError) => {
          console.error(
            `Unable to save Firestore document "${documentName}":`,
            writeError
          );

          setError(`Unable to save ${documentName}.`);
        });

        return resolvedValue;
      });
    },
    [documentName, userId]
  );

  return [value, updateValue, loading, error] as const;
}