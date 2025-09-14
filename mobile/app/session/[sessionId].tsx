import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function SessionPlaceholder() {
	const router = useRouter();
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Session details — placeholder. TODO: implement.</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	text: { color: '#374151' },
});
