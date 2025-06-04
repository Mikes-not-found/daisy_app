import {ColorPalette} from './Colors';
import { StyleSheet } from 'react-native';


export const PlaidTheme = {
  dark: false,
  colors: {
    primary: '#6577B3',
    background: '#6577B3',
    card: '#6577B3',
    text: '#000000',
    border: '#000000',
    notification: '#FFFFFF',
  },
};

export const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  defaultButton: {
    backgroundColor:  ColorPalette.yellow,
    paddingHorizontal: 130,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 30,
  },
  textButton: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredVert: {
    display: 'flex',
    alignItems: 'center',
  },
  centeredHoriz: {
    display: 'flex',
    justifyContent: 'center',
  },
  positionBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  input: {
    backgroundColor: ColorPalette.greyLight,
    paddingVertical: 12,
    borderRadius: 15,
    textAlign: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  subTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#fff',
  },
  heading: {
    paddingHorizontal: 32,
    justifyContent: 'flex-start',
    paddingBottom: 16,
  },
  body: {
    flex: 1,
    paddingHorizontal: 32,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  baseText: {
    fontSize: 16,
    marginTop: 8,
    color: '#4B4B4B',
    textAlign: 'left',
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginHorizontal: 10,
  },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  buttonContainer: {
    elevation: 4,
    backgroundColor: '#000',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 20,
    color: '#FFF',
    backgroundColor: '#000',
    fontWeight: 'bold',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
});
