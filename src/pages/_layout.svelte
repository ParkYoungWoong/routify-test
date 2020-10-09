<script>
  import crypto from 'crypto-random-string'
</script>

<slot />

<footer>
  Footer
  Random: {crypto({length: 10})}
</footer>

<style>
  footer {
    display: flex;
  }
</style>
