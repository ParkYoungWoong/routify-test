<script>
  import crypto from 'crypto-random-string'
  import RoutifyIntro from './example/_components/RoutifyIntro.svelte'
  import { metatags } from '@sveltech/routify'
  metatags.title = 'My Routify app'
  metatags.description = 'Description coming soon...'
</script>

<div>
  Random: {crypto({length: 10})}
</div>
<RoutifyIntro />
