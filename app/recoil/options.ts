import { atom, useRecoilValue, useSetRecoilState } from "recoil";

const optionsAtom = atom<OptionsType>({
  key: "options",
  default: {
    strokeColor: "#0000FF",
    strokeWidth: 5,
    roughness: 0,
    fillColor: "black",
    fillStyle: "solid",
    strokeStyle: "solid",
  },
});

export const useOptions = () => {
  const options = useRecoilValue(optionsAtom);
  return options;
};

export const useSetOptions = () => {
  const setOptions = useSetRecoilState(optionsAtom);
  return setOptions;
};
